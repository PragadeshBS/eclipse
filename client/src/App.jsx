import { useState, useEffect } from "react";

import io from "socket.io-client";
import Messages from "./components/Messages";
import { encrypt, decrypt } from "./util/denc";
import deriveSecretKey from "./util/deriveKey";
import exportCryptoKey from "./util/exportKey";
import genKeys from "./util/genKeys";
import importSecretKey from "./util/importKey";

import Message from "./models/Message";
import Status from "./components/Status";

const socket = io.connect("http://localhost:3000");

function App() {
  // Messages States
  const [message, setMessage] = useState("");
  // const [recepient, setRecepient] = useState("");
  const [messages, setMessages] = useState([]);
  const [secretKey, setSecretKey] = useState([]);
  const [users, setUsers] = useState([]);
  const [keyExchangeSucess, setKeyExchangeSuccess] = useState(false);

  const sendMessage = async () => {
    console.log("Encrypting message with the following private key");
    console.log(secretKey);
    let secret = await encrypt(message, secretKey);
    console.log("sending...");
    socket.emit("send_data", secret);
    console.log("sent message");
    setMessages((messages) => [...messages, new Message(message, true)]);
  };

  const onMessageType = (e) => {
    setMessage(e.target.value);
  };
  // const onRecepientType = (e) => {
  //   setRecepient(e.target.value);
  // };

  const sendPublicKey = async () => {
    const keyPair = await genKeys();
    const publicKeyToExport = await exportCryptoKey(keyPair.publicKey);
    socket.emit("send_public_key", publicKeyToExport);
    console.log("sent public key");
    socket.on("receive_public_key", async (receivedPublicKey) => {
      console.log("received public key from other client");
      setKeyExchangeSuccess(true);
      const k = await importSecretKey(receivedPublicKey);
      const sk = await deriveSecretKey(keyPair.privateKey, k);
      setSecretKey(sk);
      socket.on("receive_data", async (data) => {
        // console.log("params", data.ciphertext, data.iv, sk);
        console.log("Received a message, decrypting...");
        const decryptedMessage = await decrypt(data.ciphertext, data.iv, sk);
        if (decryptedMessage !== "")
          setMessages((messages) => [
            ...messages,
            new Message(decryptedMessage, false),
          ]);
      });
    });
  };

  useEffect(() => {
    socket.on("receive_existing_clients", (data) => {
      console.log("Got existing clients: " + data);
      setUsers(() => data);
    });
    socket.emit("notify");
    socket.on("requesting_public_key", async () => {
      console.log("server requesting for public key");
      await sendPublicKey();
    });
    socket.on("receive_message", (data) => {
      console.log("Received a message");
      setMessage((message) => [data.message, ...message]);
    });
    socket.on("new_user", (userId) => {
      console.log(userId + " joined");
      setUsers((users) => [userId, ...users]);
    });
    socket.on("user_left", (userId) => {
      console.log(userId + "left");
      setKeyExchangeSuccess(false);
      setUsers((users) => users.filter((user) => user !== userId));
    });
    return () => socket.emit("disconnect");
  }, []);

  return (
    <div>
      <div className="display-6">Encrypted Chat</div>
      <Messages messages={messages} />
      Enter a message:{" "}
      <div className="row align-items-center">
        <div className="col-10">
          <input
            className="form-control"
            value={message}
            onChange={onMessageType}
          />
        </div>
        <div className="col-2">
          <button className="btn my-3 btn-dark" onClick={sendMessage}>
            {/* to: <input value={recepient} onChange={onRecepientType} /> */}
            Send
          </button>
        </div>
      </div>
      <Status users={users} keyExchangeSuccess={keyExchangeSucess} />
      {/* {users &&
        users.map((user, index) => {
          return <div key={index}>{user}</div>;
        })} */}
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import io from "socket.io-client";
import Messages from "./components/Messages";
import { encrypt, decrypt } from "./util/denc";
import deriveSecretKey from "./util/deriveKey";
import exportCryptoKey from "./util/exportKey";
import genKeys from "./util/genKeys";
import importSecretKey from "./util/importKey";

const socket = io.connect("http://localhost:3000");

function App() {
  // Messages States
  const [message, setMessage] = useState("");
  const [recepient, setRecepient] = useState("");
  const [messages, setMessages] = useState([]);
  const [secretKey, setSecretKey] = useState([]);
  const [users, setUsers] = useState([]);

  const sendMessage = async () => {
    console.log(secretKey);
    let secret = await encrypt(message, secretKey);
    console.log("sending...");
    socket.emit("send_data", secret);
    console.log("sent");
  };

  const onMessageType = (e) => {
    setMessage(e.target.value);
  };
  const onRecepientType = (e) => {
    setRecepient(e.target.value);
  };

  const sendPublicKey = async () => {
    const keyPair = await genKeys();
    const publicKeyToExport = await exportCryptoKey(keyPair.publicKey);
    socket.emit("send_public_key", publicKeyToExport);
    console.log("sent public key");
    socket.on("receive_public_key", async (receivedPublicKey) => {
      console.log("received public key");
      const k = await importSecretKey(receivedPublicKey);
      const sk = await deriveSecretKey(keyPair.privateKey, k);
      setSecretKey(sk);
      socket.on("receive_data", async (data) => {
        console.log("params", data.ciphertext, data.iv, sk);
        const decryptedMessage = await decrypt(data.ciphertext, data.iv, sk);
        setMessages((messages) => [...messages, decryptedMessage]);
        console.log(some);
      });
    });
  };

  useEffect(() => {
    socket.emit("notify");
    socket.on("requesting_public_key", async () => {
      console.log("server requesting for public key");
      await sendPublicKey();
    });
    socket.on("receive_message", (data) => {
      setMessage((message) => [data.message, ...message]);
    });
    socket.on("new_user", (userId) => {
      setUsers((users) => [userId, ...users]);
    });
    return () => socket.close();
  }, []);

  return (
    <div>
      <Messages messages={messages} />
      Enter a message: <input value={message} onChange={onMessageType} />
      to: <input value={recepient} onChange={onRecepientType} />
      <button onClick={sendMessage}>Send</button>
      <h1>Users</h1>
      {users &&
        users.map((user, index) => {
          return <div key={index}>{user}</div>;
        })}
    </div>
  );
}

export default App;

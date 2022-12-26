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
import SendMessage from "./components/SendMessage";
import Logs from "./components/Logs";
import FileUpload from "./components/FileUpload";

const server =
  window.location.protocol + "//" + window.location.hostname + ":3000";
const socket = io.connect(server);
// const socket = io.connect("https://eclipse-backend.vercel.app:3000");

function App() {
  // Messages States
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [secretKey, setSecretKey] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [keyExchangeSucess, setKeyExchangeSuccess] = useState(false);

  const sendMessage = async () => {
    if (message === "") return;
    setLogs((logs) => [
      "Encrypting message with the following private key",
      ...logs,
    ]);
    console.log(secretKey);
    let secret = await encrypt(message, secretKey);
    setLogs((logs) => ["sending...", ...logs]);
    socket.emit("send_data", secret);
    setLogs((logs) => ["message sent", ...logs]);
    setMessage("");
    setMessages((messages) => [...messages, new Message(message, true)]);
  };

  const onMessageType = (e) => {
    setMessage(e.target.value);
  };

  const sendPublicKey = async () => {
    const keyPair = await genKeys();
    const publicKeyToExport = await exportCryptoKey(keyPair.publicKey);
    socket.emit("send_public_key", publicKeyToExport);
    setLogs((logs) => ["sent public key", ...logs]);
    socket.on("receive_public_key", async (receivedPublicKey) => {
      setLogs((logs) => ["received public key from other client", ...logs]);
      setKeyExchangeSuccess(true);
      const k = await importSecretKey(receivedPublicKey);
      const sk = await deriveSecretKey(keyPair.privateKey, k);
      setSecretKey(sk);
      socket.on("receive_data", async (data) => {
        // console.log("params", data.ciphertext, data.iv, sk);
        setLogs((logs) => ["Received a message, decrypting...", ...logs]);
        const decryptedMessage = await decrypt(data.ciphertext, data.iv, sk);
        console.log("decrypted message was " + decryptedMessage);
        console.log(decryptedMessage.length);
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
      setLogs((logs) => ["Got existing clients: ", ...logs]);
      console.log("existing clients: " + data);
      setUsers(() => data);
    });
    socket.emit("notify");
    socket.on("requesting_public_key", async () => {
      setLogs((logs) => ["server requesting for public key", ...logs]);
      await sendPublicKey();
    });
    // socket.on("receive_message", (data) => {
    //   setLogs((logs) => ["Received a message", ...logs]);
    //   setMessage((message) => [data.message, ...message]);
    // });
    socket.on("new_user", (userId) => {
      setLogs((logs) => [userId + " joined", ...logs]);
      setUsers((users) => [userId, ...users]);
    });
    socket.on("user_left", (userId) => {
      setLogs((logs) => [userId + " left", ...logs]);
      setKeyExchangeSuccess(false);
      setUsers((users) => users.filter((user) => user !== userId));
    });
    socket.on("download", (data) => {
      var blob = new Blob([data["file"]], { type: data["fileType"] });
      var objectUrl = URL.createObjectURL(blob);
      var anchor = document.createElement("a");
      anchor.download = data["fileName"];
      anchor.href = objectUrl;
      anchor.click();
      setLogs((logs) => ["File downloaded", ...logs]);
    });
    return () => socket.emit("disconnect");
  }, []);

  const upload = (event) => {
    setFileUploadSuccess(false);
    let file = event.target.files[0];
    socket.emit("upload", { name: file.name, file, type: file.type });
    setLogs((logs) => ["File uploaded", ...logs]);
  };

  return (
    <div className="row">
      <div className="col-8">
        <div className="display-6">Encrypted Chat & FTP with sockets</div>
        <Messages messages={messages} />
        <SendMessage
          message={message}
          onMessageType={onMessageType}
          sendMessage={sendMessage}
        />
        <Status users={users} keyExchangeSuccess={keyExchangeSucess} />
        <Logs logs={logs} />
      </div>
      <div className="col-4">
        <FileUpload
          fileUploadSuccess={fileUploadSuccess}
          onFileUpload={upload}
        />
      </div>
    </div>
  );
}

export default App;

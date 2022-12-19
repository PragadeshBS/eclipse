const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let clients = [];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  console.log("Clients " + clients);

  socket.broadcast.emit("new_user", socket.id);

  // socket.on("send_message", (data) => {
  //   socket.broadcast.emit("receive_message", data);
  // });

  socket.on("notify", () => {
    socket.emit("receive_existing_clients", clients);
    clients.push(socket.id);
    if (clients.length > 1) {
      socket.emit("requesting_public_key");
      socket.broadcast.emit("requesting_public_key");
    }
  });

  socket.on("send_public_key", (publicKey) => {
    console.log("received public key from", socket.id);
    socket.broadcast.emit("receive_public_key", publicKey);
  });

  socket.on("send_data", (secret) => {
    socket.broadcast.emit("receive_data", secret);
  });

  socket.on("disconnecting", () => {
    console.log(socket.id + " left");
    socket.broadcast.emit("user_left", socket.id);
    clients = clients.filter((clientId) => clientId !== socket.id);
  });
});

io.on("disconnect", () => console.log("dis"));

server.listen(3000, () => {
  console.log("SERVER IS RUNNING");
});

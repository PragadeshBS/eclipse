const express = require("express");
const http = require("http");
const { writeFile } = require("fs");
const path = require("path");

const app = express();
// app.use(cors());

const server = http.createServer(app);
const options = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};
const io = require("socket.io")(server, options);

// const io = new Server(server, {
//   cors: {
//     origin: true,
//     methods: ["GET", "POST"],
//   },
// });

let clients = [];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  console.log("Clients " + clients);

  socket.broadcast.emit("new_user", socket.id);

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
    console.log("received a message, forwarding");
    socket.broadcast.emit("receive_data", secret);
  });

  socket.on("disconnecting", () => {
    console.log(socket.id + " left");
    socket.broadcast.emit("user_left", socket.id);
    clients = clients.filter((clientId) => clientId !== socket.id);
  });

  socket.on("upload", (fileData) => {
    writeFile(
      path.resolve("D:\\Temp\\transferredFiles", fileData["name"]),
      fileData["file"],
      (err) => {
        console.log(err);
      }
    );
  });
});

io.on("disconnect", () => console.log("dis"));

server.listen(3000, () => {
  console.log("SERVER listening on port 3000");
});

const express = require("express");
const { createServer } = require('http');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', require('./router')); // delegate routing to router.js

const server = createServer(app);
require('./websockets')(server); // setup websockets

server.listen(PORT, '0.0.0.0', () => {
  console.log("express and socket.io listening on *:" + PORT);
});
const express = require("express");
const { Server } = require('socket.io'); // TODO: add socket.io functionality
const { createServer } = require('http');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', require('./router')); // delegate routing to router.js

const server = createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log("express listening on *:" + PORT);
});
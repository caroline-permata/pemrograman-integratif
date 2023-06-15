var http = require("http");
var fs = require("fs");
var path = require("path");
const SERVER_PORT = process.env.SERVER_PORT || 3000;
const serverApp = http.createServer(responseHandler);

serverApp.listen(SERVER_PORT);
console.log(`🖥 Server is running on port ${SERVER_PORT}`);

function responseHandler(request, response) {
  console.log(`🖥 Received request for ${request.url}`);
  var filePath = "./client" + request.url;
  if (filePath === "./client/") {
    filePath = "./client/index.html";
  }
  var fileExtension = String(path.extname(filePath)).toLowerCase();
  console.log(`🖥 Serving ${filePath}`);
  var mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  var contentType = mimeTypes[fileExtension] || "application/octet-stream";
  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code === "ENOENT") {
        fs.readFile("./client/404.html", function (error, content) {
          response.writeHead(404, { "Content-Type": contentType });
          response.end(content, "utf-8");
        });
      } else {
        response.writeHead(500);
        response.end("Sorry, there was an error: " + error.code + " ..\n");
      }
    } else {
      response.writeHead(200, { "Content-Type": contentType });
      response.end(content, "utf-8");
    }
  });
}

const io = require("socket.io")(serverApp, {
  path: "/socket.io",
});

io.attach(serverApp, {
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

var connectedUsers = {};

io.on("connection", (socket) => {
  console.log("👾 New socket connected! >>", socket.id);

  socket.on("clientConnected", (data) => {
    console.log(`clientConnected event received`, data);
    connectedUsers[socket.id] = data.userAlias;
    console.log("connectedUsers :>> ", connectedUsers);
    socket.emit("greetUser", {
      user: "server",
      message: `Welcome ${data.userAlias}! There are ${
        Object.keys(connectedUsers).length
      } users connected`,
    });
  });

  socket.on("userMessage", (data) => {
    console.log(`👾 userMessage from ${data.user}`);
    socket.broadcast.emit("broadcastMessage", {
      user: connectedUsers[data.user],
      message: data.message,
    });
  });
});

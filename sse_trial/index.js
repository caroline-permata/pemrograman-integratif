const http = require("http");

const port = 5001;

// Define the server
const server = http.createServer((req, res) => {
  console.log("Connected to the Client");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url === "/") {
    const interval = setInterval(() => {
      res.write(`data: ${new Date().toLocaleTimeString()}\n\n`);
    }, 1000);

    req.on("close", () => {
      console.log("Disconnected");
      clearInterval(interval);
      res.end();
    });
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

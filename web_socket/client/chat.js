console.log("Chat client script activated!");

let socketConnection = io.connect('http://localhost:3000');

const userAlias = prompt("Welcome! Kindly input your alias:");

socketConnection.emit("clientConnected", { userAlias });

socketConnection.on("greetUser", (data) => {
  console.log("Welcome message received >>", data);
  pushMessage(data, false);
});

function pushMessage(data, isSelf = false) {
  const messageContent = document.createElement("div");
  messageContent.classList.add("userMessage");

  if (isSelf) {
    messageContent.classList.add("sentMessage");
    messageContent.innerText = `${data.message}`;
  } else {
    if (data.user === "server") {
      messageContent.innerText = `${data.message}`;
    } else {
      messageContent.classList.add("receivedMessage");
      messageContent.innerText = `${data.user}: ${data.message}`;
    }
  }
  const chatWrapper = document.getElementById("chatWrapper");

  chatWrapper.append(messageContent);
}

const msgForm = document.getElementById("msgForm");

msgForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const msgInput = document.getElementById("msgInput");

  if (msgInput.value !== "") {
    let userMessage = msgInput.value;
    socketConnection.emit("userMessage", { user: socketConnection.id, message: userMessage });
    pushMessage({ message: userMessage }, true);
    msgInput.value = "";
  } else {
    msgInput.classList.add("errorMsg");
  }
});

socketConnection.on("broadcastMessage", (data) => {
  console.log("📢 New broadcast message >> ", data);
  pushMessage(data, false);
});
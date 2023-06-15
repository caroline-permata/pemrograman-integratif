var EventSource = require('eventsource');

var eventSource = new EventSource("http://localhost:5001");

function updateMessage(message) {
    console.log(message);
}

eventSource.onmessage = function(event) {
    updateMessage(event.data);
}

eventSource.onerror = function(error) {
    updateMessage("Server error");
    eventSource.close();
}
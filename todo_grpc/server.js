const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const admin = require("firebase-admin");

// Load the protobuf definition
const protoPath = __dirname + "/todo.proto";
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Load the service account key JSON file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
// Implement the server methods
async function createTask(call, callback) {
    const task = call.request;
    console.log("Received task:", task);
  
    db.collection("tasks")
      .add(task)
      .then((docRef) => {
        const TaskId = {
          id: docRef.id
        };
        console.log(TaskId)
        callback(null, TaskId);
      })
      .catch((error) => {
        console.error("Error:", error);
        callback(error);
      });
  }
  
  async function readTask(call, callback) {
    const taskId = call.request.id;
    if (!taskId) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, details: "Task ID is required" }, null);
    }
  
    const docRef = db.collection("tasks").doc(taskId);
    const doc = await docRef.get();
    const _res = {
        ...doc.data(),
        id : doc.id
    }
    if (doc.exists) {
      callback(null, _res);
    } else {
      callback({ code: grpc.status.NOT_FOUND, details: "Task not found" }, null);
    }
  }
  
  async function updateTask(call, callback) {
    const task = call.request;
    const docRef = db.collection("tasks").doc(task.id);
    await docRef.update(task);
    callback(null, {});
  }
  
  async function deleteTask(call, callback) {
    const taskId = call.request.id;
    const docRef = db.collection("tasks").doc(taskId);
    await docRef.delete();
    callback(null, {});
  }
  
  // Create a new gRPC server
  const server = new grpc.Server();
  
  // Add the ToDo service with the implemented methods to the server
  server.addService(todoProto.ToDo.service, {
    Create: createTask,
    Read: readTask,
    Update: updateTask,
    Delete: deleteTask,
  });

// Start the server on port 50052
server.bindAsync("0.0.0.0:50052", grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("Error binding server:", err);
      return;
    }
    console.log("Server is running on port 50052...");
    server.start();
  });
  
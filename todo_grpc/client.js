const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

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

// Initialize the gRPC client
const client = new todoProto.ToDo(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Set a deadline for gRPC calls
const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 10); // Set a 5-second deadline
const callOptions = { deadline };

// Wrap gRPC calls with Promises
function createTask(task) {
    return new Promise((resolve, reject) => {
      client.Create(task, callOptions, (error, taskId) => {
        if (error) {
          reject(error);
        } else {
          resolve(taskId);
        }
      });
    });
  }
  
  function readTask(taskId) {
    return new Promise((resolve, reject) => {
      client.Read(taskId, callOptions, (error, task) => {
        if (error) {
          reject(error);
        } else {
          resolve(task);
        }
      });
    });
  }
  
  function updateTask(task) {
    return new Promise((resolve, reject) => {
      client.Update(task, callOptions, (error, empty) => {
        if (error) {
          reject(error);
        } else {
          resolve(empty);
        }
      });
    });
  }
  
  function deleteTask(taskId) {
    return new Promise((resolve, reject) => {
      client.Delete(taskId, callOptions, (error, empty) => {
        if (error) {
          reject(error);
        } else {
          resolve(empty);
        }
      });
    });
  }
  
  // Call the server methods using async/await
  async function run() {
    try {
      const newTask = {
        title: "My Task",
        description: "A simple task",
        completed: false,
      };
  
      const taskId = await createTask(newTask);
      console.log("Created task with ID:", taskId.id);
  
      const task = await readTask(taskId);
      console.log("Retrieved task:", task);
  
      task.completed = true;
      await updateTask(task);
      console.log("Updated task:", task);
  
      await deleteTask(taskId);
      console.log("Deleted task with ID:", taskId.id);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  run();
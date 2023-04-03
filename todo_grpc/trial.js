const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const protoPath = __dirname + "/todo.proto";
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

const target = "0.0.0.0:50052";

const client = new todoProto.ToDo(
  target,
  grpc.credentials.createInsecure()
);

async function createTask(task) {
  return new Promise((resolve, reject) => {
    try {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + 30); // Set deadline to 30 seconds in the future

      client.Create(task, { deadline }, (error, response) => {
        if (error) {
          console.error("Error during createTask:", error);
          reject(error);
        } else {
          console.log("Task created successfully:", response);
          resolve(response);
        }
      });
    } catch (err) {
      console.error("Error during createTask:", err);
      reject(err);
    }
  });
}

async function readTask(taskId) {
  return new Promise((resolve, reject) => {
    try {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + 30); // Set deadline to 30 seconds in the future

      client.Read({ id: taskId }, { deadline }, (error, response) => {
        if (error) {
          console.error("Error during readTask:", error);
          reject(error);
        } else {
          console.log("Task read successfully:", response);
          resolve(response);
        }
      });
    } catch (err) {
      console.error("Error during readTask:", err);
      reject(err);
    }
  });
}
  

  async function updateTask(task) {
    return new Promise((resolve, reject) => {
      try {
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 30); // Set deadline to 30 seconds in the future
  
        client.Update(task, { deadline }, (error, response) => {
          if (error) {
            console.error("Error during updateTask:", error);
            reject(error);
          } else {
            console.log("Task updated successfully:", response);
            resolve(response);
          }
        });
      } catch (err) {
        console.error("Error during updateTask:", err);
        reject(err);
      }
    });
  }
  

  async function deleteTask(taskId) {
    return new Promise((resolve, reject) => {
      try {
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 30); // Set deadline to 30 seconds in the future
  
        client.Delete({ id: taskId }, { deadline }, (error, response) => {
          if (error) {
            console.error("Error during deleteTask:", error);
            reject(error);
          } else {
            console.log("Task deleted successfully:", response);
            resolve(response);
          }
        });
      } catch (err) {
        console.error("Error during deleteTask:", err);
        reject(err);
      }
    });
  }  

  grpc.waitForClientReady(client, Infinity, (error) => {
    if (error) {
      console.error("Failed to connect to the server:", error);
      process.exit(1);
    } else {
      console.log("Connected to the server");
      run();
    }
  });
  
  async function run() {
    try {
      const task1 = {
        title: "Task 1",
        description: "A simple task 1",
        completed: false,
      };
  
      const task2 = {
        title: "Task 2",
        description: "A simple task 2",
        completed: false,
      };
  
      const createdTask1 = await createTask(task1);
      console.log("Created task with ID:", createdTask1.id);
  
      const createdTask2 = await createTask(task2);
      console.log("Created task with ID:", createdTask2.id);
  
      const readTask1 = await readTask(createdTask1.id);
      console.log("Read task with ID:", readTask1.id, readTask1);
  
      const updatedTask1 = {
        id: createdTask1.id,
        title: "Updated Task 1",
        description: "An updated task 1",
        completed: true,
      };
      await updateTask(updatedTask1);
      console.log("Updated task with ID:", createdTask1.id);
  
      const readUpdatedTask1 = await readTask(createdTask1.id);
      console.log("Read updated task with ID:", readUpdatedTask1.id, readUpdatedTask1);
  
      await deleteTask(createdTask1.id);
      console.log("Deleted task with ID:", createdTask1.id);
    } 
    catch (error) 
    {
      console.error("Error:", error);
    }
  }
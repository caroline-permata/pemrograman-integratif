# Pemrograman Integratif 

    Caroline Permata - 5027211048
    gRPC - To Do List 

## Tools 
- Language -> NodeJS 
- Database -> Firebase 

## Step 
#### 1. Buat direktori 
```bash 
mkdir todo_grpc
```

#### 2. Pindah ke direktori tersebut 
``` bash 
cd todo_grpc
```

#### 3. Jalankan `npm init` untuk membuat file `package.json` baru
``` bash
npm init -y
 ```

#### 4. Install dependensi yang diperlukan dengan menggunakan `npm install`
``` bash
npm install @grpc/grpc-js @grpc/proto-loader firebase-admin
 ```

#### 5. Buat 3 file 
- `todo.proto` 
- `server.js` 
- `run.js`   

#### 6. Unduh file `serviceAccountKey.json` dari Firebase console untuk menghubungkan program dengan Firebase 

#### 7. Untuk menjalankan file tersebut, buka 2 terminal yang berbeda
 - Pada `server.js`, compile menggunakan commad `nodemon server.js` untuk melakukan pembaruan otomatis pada program
- Pada file `run.js`, compile menggunakan command `node run.js` untuk mengirim perintah dan menguji server gRPC

## CRUD Function 

#### 1. Proto File 
``` bash 
service ToDo {
  rpc Create (Task) returns (TaskId);
  rpc Read (TaskId) returns (Task);
  rpc Update (Task) returns (Empty);
  rpc Delete (TaskId) returns (Empty);
}

message Task {
  string id = 1;
  string title = 2;
  string description = 3;
  bool completed = 4;
}

message TaskId {
  string id = 1;
}

message Empty {}
```

#### 2. Server 
Connect to Firebase 
``` bash 
// Load the service account key JSON file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
```

Add service in server.js 
``` bash 
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
```

#### 3. Testing File 
Pada saat menguji file server.js, kita membutuhkan file lain yang saya beri nama run.js 
``` bash 
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

      client.Read(taskId, { deadline }, (error, response) => {
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
     
  
      const createdTask2 = await createTask(task2);
      
      console.log(createdTask1)
      const readTask1 = await readTask(createdTask1);
      console.log("Read task with ID:", readTask1.id, readTask1);
  
      const updatedTask1 = {
        id: createdTask1.id,
        title: "Updated Task 1",
        description: "An updated task 1",
        completed: true,
      };
      await updateTask(updatedTask1);
      console.log("Updated task with ID:", createdTask1.id);

      console.log(createdTask1)
      const readUpdateTask1 = await readTask({id : createdTask1.id});
      console.log("Read Update task with ID:", readUpdateTask1.id, readUpdateTask1);
  
      await deleteTask(createdTask1.id);
      console.log("Deleted task with ID:", {id : createdTask1.id});
    } 
    catch (error) 
    {
      console.error("Error:", error);
    }
  }
``` 

Data dummy 
``` bash 
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
```

## Dokumentasi 

#### 1. Membaca task 
<a href='https://www.linkpicture.com/view.php?img=LPic642af7572284c30939856'><img src='https://www.linkpicture.com/q/Screen-Shot-2023-04-03-at-22.16.24.png' type='image'></a>

#### 2. Membuat task 
<a href='https://www.linkpicture.com/view.php?img=LPic642af7e75c7be1942994858'><img src='https://www.linkpicture.com/q/Screen-Shot-2023-04-03-at-22.27.40.png' type='image'></a>

#### 3. Menambahkan task 
<a href='https://www.linkpicture.com/view.php?img=LPic642af8559ac061048631649'><img src='https://www.linkpicture.com/q/Screen-Shot-2023-04-03-at-22.27.53_2.png' type='image'></a>

#### 4. Melakukan edit/update pada task
<a href='https://www.linkpicture.com/view.php?img=LPic642af6f8dc4f52020798826'><img src='https://www.linkpicture.com/q/Screen-Shot-2023-04-03-at-22.19.31.png' type='image'></a>

#### 5. Menghapus task 
<a href='https://www.linkpicture.com/view.php?img=LPic642af8559ac061048631649'><img src='https://www.linkpicture.com/q/Screen-Shot-2023-04-03-at-22.27.53_2.png' type='image'></a>
Seperti yang bisa dilihat pada compiler bahwa task dengan ID `D7k2xs5fJUXFXeXFcjf1` berhasil di hapus dan dapat dilihat pada gambar diatas sudah tidak ada task yang memiliki task ID tersebut

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const firebase = require("firebase/compat/app");
require("firebase/compat/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyD67S9Ph_al8V0UDwErVe1HIUf2n5oMgDU",
    authDomain: "pi-buhafara.firebaseapp.com",
    projectId: "pi-buhafara",
    storageBucket: "pi-buhafara.appspot.com",
    messagingSenderId: "684939558907",
    appId: "1:684939558907:web:906c753264540591b6d55e"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  const protoPath = __dirname + "/todo.proto";
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;
  
  const todoService = {
    Create: async (call, callback) => {
      console.log("Received Create request");
      const task = call.request;
      const taskCollection = db.collection("tasks");
      const newDocRef = taskCollection.doc();
      const newDoc = await taskCollection.add(task);
      const newTask = { id: newDoc.id, ...task };
      callback(null, { id: newTask.id });

    },
    Read: async (call, callback) => {
        console.log("Received Read request");
        const taskId = call.request.id;
        const taskRef = db.collection("tasks").doc(taskId);
        const doc = await taskRef.get();
    
        if (doc.exists) {
            const task = doc.data();
            task.id = doc.id;
            callback(null, { id: task.id, title: task.title, description: task.description, completed: task.completed });
        } else {
            callback({ code: grpc.status.NOT_FOUND, details: "Not Found" });
        }        
      },
    Update: async (call, callback) => {
      console.log("Received Update request");
      const task = call.request;
      const taskRef = db.collection("tasks").doc(task.id.toString());
      await taskRef.update({
        title: task.title,
        description: task.description,
        completed: task.completed,
      });
      callback(null, {});
    },
    Delete: async (call, callback) => {
      console.log("Received Delete request");
      const taskId = call.request.id;
      const taskRef = db.collection("tasks").doc(taskId);
      await taskRef.delete();
      callback(null, {});
    },
  };
  
  const server = new grpc.Server();
  server.addService(todoProto.ToDo.service, todoService);
  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("Error binding server:", err);
      return;
    }
    console.log(`gRPC server running on port ${port}`);
    server.start();
  });
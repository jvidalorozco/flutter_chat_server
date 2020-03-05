let app = require("express")();
let http = require("http").Server(app);
let io = require("socket.io")(http);

const users = { };
const rooms = { };


// noinspection JSUnresolvedFunction
/**
 * Handle the socket connection event.  All other events must be hooked up inside this.
 */
io.on("connection", (socket) => {
   console.log("\n\nConnection established with a client");
  
  
   io.on("validate", (inData, inCallback) => {
     const user = users[inData.userName];
     if(user){
         if(user.password === inData.password){
             inCallback({status : "ok"});
         }else{
             inCallback({status : "fail"});
         }
     }else{
        users[inData.userName] = inData;
        io.broadcast.emit("newUser", users);
        inCallback({status : "created"});
     }
   });

   io.on("create", (inData, inCallback) => {
     if(rooms[inData.roomName]){
         inCallback({status: "exists"})
     }else{
         inData.users = { };
         rooms[inData.roomName] = inData;
         io.broadcast.emit("created", rooms);
         inCallback({ status: "created", rooms: rooms});
     }
   });


   io.on("listRooms", (inData,inCallback) => {
     inCallback(rooms);
   });

   io.on("join", (inData, inCallback) => {
     const room = rooms[inData.roomName];
     rooms[inData.roomName];
     if(Object.keys(rooms.users).length >= rooms.maxPeople){
         inCallback({status: "full room"})
     }else{
       rooms.users[inData.userName] = users[inData.userName];
       io.broadcast.emit("joined",room);
       inCallback({status: "joined", room: room})
     }  
   });

   io.on("post", (inData, inCallback) => {
    io.broadcast.emit("posted", inData);
    inCallback({status: "ok"});
   });

   io.on("invite", (inData, inCallback) => {
    io.broadcast.emit("invited", inData);
    inCallback({status : "ok" });
   });

   io.on("leave", (inData,inCallback) => {
    const room = rooms[inData.roomName]; 
    delete
    rooms.users[inData.userName];
    io.broadcast.emit("left", room);
    inCallback({ status : "ok"});
   });

   io.on("kick", (inData, inCallback) =>{
     const room = rooms[inData.roomName];
     const users = rooms.users;
     delete
     users[inData.userName];
     io.broadcast.emit("kicked",room);
     inCallback({status : "ok"})
   });

});

http.listen(3000, function(){
   console.log("listen on *:3000")
});
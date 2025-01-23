require("dotenv").config({path: "../.env"})
const express = require("express");
const app = express();
const port = 8080;

const http = require("http")
const server = http.createServer(app);
const {Server} = require("socket.io");
const ACTIONS = require("./Actions");
const bodyParser = require("body-parser")
const cors = require("cors")
const router = require("./routes/run-router")
const path = require("path")

const DIRNAME = path.resolve()

app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json());
app.use(express.json());
// app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,  // Allow only requests from this React app
  methods: ['GET', 'POST'],   
  credentials: true 
}));

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL, // Ensure this matches your frontend URL
        methods: ["GET", "POST"],
    },
})

const userSocketMapping = {}

function getAllConnectedClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMapping[socketId]
        }
    })
}





io.on("connection", (socket) => {
    console.log("user connected")

    socket.on(ACTIONS.JOIN, ({roomId, username}) => {
        userSocketMapping[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId)
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id
            })
        })
    })

    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {code})
    })
    
    
    socket.on(ACTIONS.SYNC_CODE, ({code, socketId}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {code})
    })

    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId : socket.id,
                username : userSocketMapping[socket.id]
            })
        })
        delete userSocketMapping[socket.id];
        socket.leave()
    })
})
app.use("/", router)

app.use(express.static(path.join(DIRNAME, "client/dist")))
app.get("*", (_, res) => {
    res.sendFile(path.join(DIRNAME, "client","dist", "index.html"))
})

server.listen(port, () => {
    console.log(`server is listening on port ${port}`)
})

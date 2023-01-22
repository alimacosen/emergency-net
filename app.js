const express = require('express');
const router = express();
const http = require('http');
const app = http.createServer(router);
const path = require('path');
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const SocketController = require("./controllers/socket.controller");
const io = new Server(app);
const logger = require("./loggers/logger")
const filePath = [
    {ref: '/', path: '/views/home/home.html'},
    {ref: '/signin', path: '/views/signin/signin.html'},
    {ref: '/performance', path: '/views/performance/performance.html'},
    {ref: '/management', path: '/views/management/management.html'},
    {ref: '/emergencySupply', path: '/views/emergencySupply/emergencySupply.html'},
    {ref: '/acknowledge', path: '/views/popup_window/pop_and_hide.html'},
    {ref: '/chatroom', path: '/views/message/message.html'},
    {ref: '/search', path: '/views/search/search.html'},
    {ref: '/dangerReport', path: '/views/danger_report/dangerReport.html'},
    {ref: '/rescue', path: '/views/rescue/rescue.html'},
    {ref: '/navigation', path: '/views/navigation/navigation.html'},
    {ref: '/announcement', path: '/views/announcement/announcement.html'},
    {ref: '/profile', path: '/views/profile/profile.html'},
    {ref: '/private', path: '/views/privatechat/privatechat.html'},
    {ref: '/shelter', path: '/views/shelter/shelter.html'},
    {ref: '/informing_message', path: '/views/popup_window/informing_message.html'},
];

router.use((req, res, next) => {
    req.io = io;
    return next();
});

router.use(express.static(path.join(__dirname, '/public')));
router.use(express.static(path.join(__dirname, '/views')));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());

global.serverStatus = 1;  // 1 normal  2 test
global.administrater = "";

router.use("/messages", require("./controllers/message.controller.js"));
router.use("/sessions", require("./controllers/login.controller.js"));
router.use("/users", require("./controllers/user.controller.js"));
router.use("/performance", require("./controllers/performance.controller.js"));
router.use("/chatroom", require("./controllers/chatroom.controller.js"));
router.use("/announcements", require("./controllers/announcement.controller.js"));
router.use("/dangerReports", require("./controllers/dangerReport.controller.js"));
router.use("/shelters", require("./controllers/shelter.controller.js"));
router.use("/rescues", require("./controllers/rescue.controller.js"));
router.use("/emergencySupplies", require("./controllers/emergencySupply.controller.js"));
router.use("/emergencySupplyRequest", require("./controllers/emergencySupplyRequest.controller.js"));

for (let i = 0; i < filePath.length; i++){
    router.get(filePath[i].ref, (req, res) => {
        res.sendFile(__dirname + filePath[i].path);
    });
}

io.on('connection', (socket) => {
    logger.info(socket.handshake.auth.userID + ' connected');
    let socketController = new SocketController(io, socket);
});

module.exports = app;
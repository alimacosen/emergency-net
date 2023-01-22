const UserModel = require("../models/user.model.js");
const mongoose = require('mongoose');
const UserSchema = require('../schema/user.schema.js').UserSchema;
const User = mongoose.model('user', UserSchema);
const Config = require("../config/config");


class SocketController {
    io
    socket
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
        this.socket.join(this.socket.handshake.auth.userID);
        this.onListen();
    }

    onListen = () => {
        this.socket.on('disconnect', this.disconnect);
    };

    disconnect = () => {
        console.log('user disconnected');
        //TODO: investigate how to keep socket connected when redirect to another page; then call setUserOffline()
    };

    setUserOffline = () => {
        let userID = this.socket.handshake.auth.userID
        let userModel = UserModel.getInstance(User);
        userModel.setUserActStatus(userID, false);

        userModel.asyncFindUserById(userID).then(
            (user) => {
                this.io.emit('on off change', JSON.stringify({
                    status: Config.OFFLINE,
                    userInfo: user,
                    msg: "user has logged out."
                }));
            });
    }
}

module.exports = SocketController;

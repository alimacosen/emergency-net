class UserStatusModel {
    mongoose;

    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    addUserStatus(userStatus) {
        return this.mongoose.create(userStatus);
    }

    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new UserStatusModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = UserStatusModel;
class ShelterPostModel {
    mongoose;

    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    createPost(post) {
        return this.mongoose.create(post);
    }

    deletePost(postID) {
        return this.mongoose.findOneAndDelete({postID: postID});
    }

    updatePost(postID, newPostField) {
        return this.mongoose.findOneAndUpdate({postID: postID}, newPostField);
    }

    findPosts(filter) {
        return this.mongoose.find(filter).sort({updateDate: -1}).exec();
    }


    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new ShelterPostModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = ShelterPostModel;

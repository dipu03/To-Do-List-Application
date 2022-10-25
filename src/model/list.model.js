const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    name : {
        type : String,
        require : true
    },
    itemsId : {
        type : [mongoose.Schema.ObjectId],
        ref : "Item"
    }
}, {timestamps:true, versionKey:false})

module.exports = mongoose.model("List", listSchema);
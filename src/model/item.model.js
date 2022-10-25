const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name : {
        type : String,
        require : true
    },
    listId : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : "List"
    }
}, {timestamps:true, versionKey:false})

module.exports = mongoose.model("Item", itemSchema);
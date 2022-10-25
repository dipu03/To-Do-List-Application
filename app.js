const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const serverConfig = require("./src/config/serverConfig");
const dbConfig = require("./src/config/dbConfig");
const List = require('./src/model/list.model');
const Item = require('./src/model/item.model');
var ObjectId = require('mongoose').Types.ObjectId;

// setting the connection with db
mongoose.connect(dbConfig.DB_URL);
const db = mongoose.connection;

db.once("open", () => {
  console.log("Connection Establisher Successfully !!");
});

db.on("error", () => {
  console.log("Error occured while making connection witrh DB");
});


// Creating Default data
async function init() {
    
  await List.collection.drop();
  await Item.collection.drop();

    const defaultList = await List.create({name : "Today"}) 

    const items = [];
    items.push("Welcome to our App", "<--: Check the box to delete Task", "Hit the + button to add new task" );

    for(let i=0; i<items.length; i++){
        let currItem = await Item.create({name : items[i], listId : defaultList._id});
        defaultList.itemsId.push(currItem._id)
    }
    await defaultList.save()
}
init();

// Home Route get
app.get("/", async function (req, res) {

    let items = await Item.find();

    res.render("list", { listTitle: "Today", newListItems: items });
});


app.post("/", async function(req, res){
    const listName = req.body.list;
    const itemName = req.body.newItem;

    const list = await List.findOne({name : listName});
    const item = await Item.create({name : itemName, listId : list._id});

    list.itemsId.push(item._id);
    await list.save()

    if(listName != "Today"){
        res.redirect("/" + listName);

    }else{
        res.redirect("/");
    }
});

app.get("/:listName", async (req, res) => {

    const capitalizerString = _.capitalize(req.params.listName)
    let list = await List.findOne({name : capitalizerString});

    if(!list){
        const obj = {
            name : capitalizerString
        }
        list = await List.create(obj)
    }
    let items = await Item.find({_id : list.itemsId})
    res.render("list", ({listTitle : capitalizerString, newListItems : items}))
})
 
app.post("/delete", async (req, res) => {
    
    let checkedItemId = req.body.checkbox;
    let listTitle = req.body.hiddenTitleName;

    await Item.deleteOne({_id : checkedItemId});
    await List.findOneAndUpdate({name : listTitle}, {$pull : {itemsId : {_id : checkedItemId }}});
    
    if(listTitle === "Today"){
        
        res.redirect("/");
    }else{
        res.redirect("/" + listTitle)
    } 
})

app.get("/about", function(req, res){
  res.render("about");
});
   
app.listen(serverConfig.PORT, function () {
  console.log("Server started on port: " + serverConfig.PORT);
});


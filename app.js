const express = require("express")
const bodyParser = require("body-parser")
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose")
const _ = require("lodash")


const app  = express()
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine", "ejs")
app.use(express.static("public"))


mongoose.connect("mongodb+srv://admin-harkiran:test123@cluster0.pop9k.mongodb.net/todoListDB",  { useNewUrlParser: true, useUnifiedTopology: true })

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = new mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to you todoList!"
})

const item2 = new Item({
  name: "Hit the + button to add a new line"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3]

const listSchema = new mongoose.Schema({
  name:String,
  items: [itemsSchema]
})

const List = new mongoose.model("List", listSchema)

app.get("/", function(req, res){

  Item.find(function(err, itemsDB){
    if (err){
      console.log(err)
    }else if(itemsDB.length ===0){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err)
        }else{
          console.log("Default items have been added")
        }
      })
      res.redirect("/")
    }
    else{
      res.render("list", {listTitle: "Today", newItemList: itemsDB})
    }
  })

})

app.post("/", function(req, res){
  const itemName = req.body.todoItem
  const listName = req.body.list

let newItem = Item({
  name: itemName
})

if (listName === "Today"){
  newItem.save()
  res.redirect("/")
}else{
  List.findOne({name:listName}, function(err, foundList){
    foundList.items.push(newItem)
    foundList.save()
    res.redirect("/"+ listName)
  })
}

})

app.post("/delete", function(req, res){
  const checkedItemId = _.split(req.body.checkbox, ",")[0]
  let listName = _.split(req.body.checkbox, ",")[1]


  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err)
      }
      else{
        console.log("Item has beem successfully deleted checked item")
        res.redirect("/")
      }
    })
  }else{
      List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}} , function(err, foundList){
      if (!err){
        res.redirect("/"+listName)
      }
  })
}

})


app.get("/:customListName", function(req, res){
  const customListName = _.startCase(req.params.customListName)

  List.findOne({name:customListName}, function(err, foundList){
    if (!err){
      if(!foundList){
        const list = new List({
           name: customListName,
           items: defaultItems
         })
         list.save()
         res.redirect("/"+ customListName)
      }else {
      res.render("list", {listTitle: foundList.name, newItemList: foundList.items})
    }
  }
  })

})


app.listen(3000, function(){
  console.log("Server has started on port 3000")
})

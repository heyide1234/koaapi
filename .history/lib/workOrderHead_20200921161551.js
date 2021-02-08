const query = require("./mysql");
const DB = require("./mongodb");

// var mongoose = require("mongoose");
// var Schema = mongoose.Schema;

// //声明Schema
// var nodeSchema = new Schema({
//   name: String,
//   age: Number,
// });
// //构建model
// mongoose.model("Node", nodeSchema);
// //简单的数据交互
// //创建两个实例
// var node = new Node(
//   { name: "Edward", age: "23" }
// );
// node.save(function (err) {
//   if (err)
//   {
//     console.log(err);
//   } else
//   {
//     console.log("The new node is saved");
//   }
// });

class usersSql {
  getpage() {
    return DB.queryNum("workOrderHead");
  }
  findByPageNum(num) {
    return DB.queryByPageNum("workOrderHead", num.PageNum);
  }
  insert(v) {
    console.log(v);
    return DB.insert("workOrderHead", v);
  }
  delete(v) {
    return DB.delete("workOrderHead", { _id: DB.getObjectID(v.id) });
  }
  update(v) {
    return DB.update(
      "workOrderHead",
      { _id: DB.getObjectID(v.id.id) },
      v.forms
    );
  }
}

module.exports = new usersSql();

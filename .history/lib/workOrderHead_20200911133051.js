const query = require("./mysql");
const DB = require("./mongodb");

class usersSql {
  getpage() {
    return DB.queryNum("workOrderHead");
  }
  findByPageNum(num) {
    return DB.queryByPageNum("workOrderHead", num.PageNum);
  }
  insert(v) {
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

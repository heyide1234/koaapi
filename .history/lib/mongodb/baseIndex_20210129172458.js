// /mongodb/index.js

const { MongoClient, ObjectID } = require("mongodb");
const Config = require("./config");

class Db {
  static getInstance() {
    // 单例模式 解决多次实例化 实例不共享的问题
    if (!Db.instance) {
      Db.instance = new Db();
    }

    return Db.instance;
  }

  constructor() {
    this.dbClient = ""; //db对象
    this.connect(); // 实例化的时候就连接数据库
  }

  connect() {
    // 连接数据库
    return new Promise((resolve, reject) => {
      if (!this.dbClient) {
        //解决数据库多次连接的问题
        MongoClient.connect(
          Config.dbUrl,
          { useUnifiedTopology: true },
          (err, client) => {
            if (err) {
              reject(err);
              return;
            }
            this.dbClient = client.db(Config.baseDbName);
            resolve(this.dbClient);
          }
        );
      } else {
        resolve(this.dbClient);
      }
    });
  }

  //获取总条数
  queryNum(collection, json1 = {}) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        let result = db.collection(collection).find(JSON.parse(json1)).count((err, result) => {
          if (!err) {
            resolve(result);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  // 分页查询
  queryByPageNum(collection, num, sortJson = { _id: 1 }, whereJson = {}) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        let result = db
          .collection(collection)
          .find(JSON.parse(whereJson))
          .sort(JSON.parse(sortJson))
          .limit(10)
          .skip(parseInt(num));

        result.toArray((err, docs) => {
          if (!err) {
            resolve(docs);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  //查找操作 collection：表名 ，json：查找条件
  find(collection, json1, sortJson) {
    if (typeof json1 != "object") {
      json1 = JSON.parse(json1)
    }
    if (typeof sortJson != "object") {
      sortJson = JSON.parse(sortJson)
    }
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        let result = db
          .collection(collection)
          .find(json1)
          .sort(sortJson);
        result.toArray((err, docs) => {
          if (!err) {
            resolve(docs);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  //新增操作
  insert(collection, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collection).insertOne(json, (err, result) => {
          if (!err) {
            resolve(result);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  //修改操作
  update(collection, json1, json2) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collection).updateMany(
          json1, //条件
          {
            $set: json2, //改变后的值
          },
          (err, result) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          }
        );
      });
    });
  }

  //删除操作
  deleteOne(collection, json) {

    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collection).removeOne(json, (err, result) => {
          if (!err) {
            resolve(result);
          } else {
            reject(err);
          }
        });
      });
    });
  }
  //删除操作
  delete(collection, json) {

    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collection).remove(json, (err, result) => {
          if (!err) {
            resolve(result);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  //在进行查询或者删除操作的时候，我们一般都会通过id去进行操作，但是我们直接使用传递过来的id是不起作用的，需要使用mongodb提供的ObjectID方法，生成一个新的id去查询。
  getObjectID(id) {
    return new ObjectID(id);
  }
}

module.exports = Db.getInstance();

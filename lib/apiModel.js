// const query = require("./mysql");
// const { Db } = require("mongodb");
const BASEDB = require("./mongodb/baseIndex");
const DB = require("./mongodb/index");

class apiModelSql {
  /**
   * @param {table} 表名
   * @param {where} 条件 可为null
   */
  find(param) {

    if (typeof (param.dataBase) != "undefined") {
      return BASEDB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
    }
    return DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
  }
  /**
   * @param {table} 表名
   */
  getpage(param) {
    if (typeof (param.dataBase) != "undefined") {
      return BASEDB.queryNum(param.table, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
    }
    return DB.queryNum(param.table, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
  }
  /**
   * @param {table} 表名
   * @param {PageNum} 条件 跳过的行数
   */
  findByPageNum(param) {
    if (typeof (param.dataBase) != "undefined") {
      return BASEDB.queryByPageNum(param.table, param.PageNum, param.sortJson, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
    }
    return DB.queryByPageNum(param.table, param.PageNum, param.sortJson, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
  }
  /**
   * @param {table} 表名
   * @param {form} 数据 插入的数据内容
   */
  insert(data) {
    if (typeof (data.dataBase) != "undefined") {
      return BASEDB.insert(data.table, data.form);
    }
    return DB.insert(data.table, data.form);
  }
  /**
   * @param {table} 表名
   * @param {id} 数据 表ID
   */

  delete(data) {
    if (typeof (data.dataBase) != "undefined") {
      return BASEDB.deleteOne(data.table, { _id: DB.getObjectID(data.id) });
    }
    return DB.deleteOne(data.table, { _id: DB.getObjectID(data.id) });
  }
  /**
   * @param {table} 表名
   * @param {id} 数据 表ID
   */

  deleteByWhere(data) {
    if (typeof (data.dataBase) != "undefined") {
      return BASEDB.delete(data.table, data.where);
    }
    return DB.delete(data.table, data.where);
  }
  /**
   * @param {table} 表名
   * @param {id} 数据 表ID
   */
  update(data) {
    if (typeof (data.dataBase) != "undefined") {
      return BASEDB.update(data.table, { _id: DB.getObjectID(data.id) }, data.form);
    }
    return DB.update(data.table, { _id: DB.getObjectID(data.id) }, data.form);
  }

  updateByWhere(data) {
    if (typeof (data.dataBase) != "undefined") {
      return BASEDB.update(data.table, data.where, data.form);
    }
    return DB.update(data.table, data.where, data.form);
  }
}

module.exports = new apiModelSql();

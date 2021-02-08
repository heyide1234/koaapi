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
    if (typeof (param.dataBase) === "undefined") {
      return DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
    }
    return BASEDB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
  }
  /**
   * @param {table} 表名
   */
  getpage(param) {

    return DB.queryNum(param.table, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
  }
  /**
   * @param {table} 表名
   * @param {PageNum} 条件 跳过的行数
   */
  findByPageNum(param) {

    return DB.queryByPageNum(param.table, param.PageNum, param.sortJson, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
  }
  /**
   * @param {table} 表名
   * @param {form} 数据 插入的数据内容
   */
  insert(data) {

    return DB.insert(data.table, data.form);
  }
  /**
   * @param {table} 表名
   * @param {id} 数据 表ID
   */

  delete(data) {

    return DB.deleteOne(data.table, { _id: DB.getObjectID(data.id) });
  }
  /**
   * @param {table} 表名
   * @param {id} 数据 表ID
   */

  deleteByWhere(data) {

    return DB.delete(data.table, data.where);
  }
  /**
   * @param {table} 表名
   * @param {id} 数据 表ID
   */
  update(data) {
    return DB.update(data.table, { _id: DB.getObjectID(data.id) }, data.form);
  }

  updateByWhere(data) {

    return DB.update(data.table, data.where, data.form);
  }
}

module.exports = new apiModelSql();

const query = require("./mysql");

class usersSql {
  // findAllData() {
  //   let _sql = `SELECT * FROM user`;
  //   return query(_sql);
  // }
  // insertData(v) {
  //   let _sql = `insert into user set user_name=?,
  //   user_pwd=?,user_sex=?,user_role=?,user_createdate=?;`;
  //   // let  _sql = `insert into user set user_name = "${v.name}";`
  //   return query(_sql, v);
  // }
  // deleteData(name) {
  //   let _sql = `delete from user where user_name="${name}";`;
  //   return query(_sql);
  // }
  // updateData(data) {
  //   let _sql = `update user set user_age=? where user_name=?;`;
  //   return query(_sql, data);
  // }
  insert(v) {
    let _sql = `insert into processList set SerialNumber="${v.SerialNumber}",
    ProcessName="${v.ProcessName}",MaterialName="${v.MaterialName}",
    MaterialNumber="${v.MaterialNumber}",MaterialSpec="${v.MaterialSpec}",
    Number="${v.Number}",creater="${v.creater}";`;

    return query(_sql, v);
  }

  findBySerialNumber(v) {
    console.log("--------------", v);
    let _sql = `SELECT * FROM processList where SerialNumber="${v.SerialNumber}";`;
    return query(_sql, v);
  }

  findProcessNameBySerialNumber(v) {
    console.log("----------", v);
    let _sql = `SELECT distinct ProcessName FROM processList where SerialNumber="${v.SerialNumber}";`;
    return query(_sql, v);
  }
}

module.exports = new usersSql();

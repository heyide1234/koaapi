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
  // insert(v) {
  //   let _sql = `update picking set status=1, creater="${v.creater}"
  //   where SerialNumber="${v.SerialNumber}"
  //   and ProcessName="${v.ProcessName}"
  //   and MaterialNumber="${v.MaterialNumber}";`;
  //   return query(_sql, v);
  // }
  // delete(v) {
  //   let _sql = `update picking set status=0, creater="${v.creater}"
  //   where SerialNumber="${v.SerialNumber}"
  //   and ProcessName="${v.ProcessName}"
  //   and MaterialNumber="${v.MaterialNumber}";`;
  //   return query(_sql, v);
  // }
  findBySerialNumberAndProcessName(v) {
    let _sql = `SELECT * FROM picking 
    where SerialNumber="${v.SerialNumber}" 
    and ProcessName="${v.ProcessName}";`;

    return query(_sql);
  }
  insert(v) {
    console.log("---------------------------进入--------------------", v);
    let _sql = `insert into picking set SerialNumber="${v.SerialNumber}",
    ProcessName="${v.ProcessName}",MaterialNumber="${v.MaterialNumber}",
    creater="${v.creater}";`;
    return query(_sql, v);
  }
  delete(v) {
    console.log("------dele--------", v);
    let _sql = `delete from picking 
    where SerialNumber="${v.SerialNumber}" 
    and ProcessName="${v.ProcessName}" 
    and MaterialNumber="${v.MaterialNumber}";`;
    return query(_sql, v);
  }
  updateStatus(v) {
    console.log("----updateStatus---", v);
    let _sql = `update picking set status="${v.status}", creater1="${v.creater}" 
    where SerialNumber="${v.SerialNumber}" 
    and  ProcessName="${v.ProcessName}"
    and  MaterialNumber="${v.MaterialNumber}";`;
    return query(_sql, v);
  }
}

module.exports = new usersSql();

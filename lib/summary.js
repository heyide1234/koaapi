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

  findsummary(v) {
    console.log("--------------", v);
    let _sql = `SELECT
	workorderhead.ProductName, 
	workorderhead.SpecModel, 
	workorderhead.ManufactureSN, 
	workorderhead.MaterielNum, 
	processlist.SerialNumber, 
	processlist.ProcessName, 
	processlist.MaterialName, 
	processlist.MaterialNumber, 
	processlist.MaterialSpec, 
	processlist.Number, 
  processlist.creater ProcessEngineer, 
  processlist.MaterialNumber batchingCode,
	picking.creater Proportioner, 
  picking.creater1 MaterialCollector,
  picking.creater1 operator
    FROM
	workorderhead
	INNER JOIN
	processlist
	ON 
	processlist.SerialNumber = workorderhead.SerialNumber
	INNER JOIN
	picking
	ON 
	picking.SerialNumber=processlist.SerialNumber and picking.ProcessName=processlist.ProcessName
	where workorderhead.SerialNumber="${v.SerialNumber}";`;
    return query(_sql, v);
  }
}

module.exports = new usersSql();

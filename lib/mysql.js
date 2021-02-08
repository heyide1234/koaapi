const mysql = require("mysql");
const config = require("../config/default.js");

const pool = mysql.createPool({
  host: config.database.HOST,
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  port: config.database.PORT,
  dateStrings: true,
});

let query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
};

module.exports = query;
// CREATE TABLE `user` (
//     `user_id` int(11) NOT NULL AUTO_INCREMENT,
//     `user_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
//     `user_pwd` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
//     `user_sex` varchar(2) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
//     `user_age` int(3) DEFAULT NULL,
//     `user_city` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
//     `user_tel` int(13) DEFAULT NULL,
//     `user_email` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
//     `user_avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
//     `user_role` int(2) NOT NULL,
//     `user_createdate` date NOT NULL,
//     PRIMARY KEY (`user_id`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8;

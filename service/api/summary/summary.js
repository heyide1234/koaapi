const userModel = require("../../../lib/summary.js");

class usersService {
  // static async findAll() {
  //   return await userModel.findAllData();
  // }

  // static async delete(data) {
  //   return await userModel.deleteData(data.name);
  // }
  // static async update(data) {
  //   let v = [data.age, data.name];
  //   return await userModel.updateData(v);
  // }

  static async findsummary(data) {
    return await userModel.findsummary(data);
  }
}

module.exports = usersService;

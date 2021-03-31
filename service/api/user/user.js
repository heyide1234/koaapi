const userModel = require("../../../lib/user.js");

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

  static async findNameByUserNameAndPassword(data) {
    return await userModel.findNameByUserNameAndPassword(data);
  }
}

module.exports = usersService;

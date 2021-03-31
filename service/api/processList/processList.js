const userModel = require("../../../lib/processList.js");

class usersService {
  // static async findAll() {
  //   return await userModel.findAllData();
  // }
  static async insert(data) {
    return await userModel.insert(data);
  }
  // static async delete(data) {
  //   return await userModel.deleteData(data.name);
  // }
  // static async update(data) {
  //   let v = [data.age, data.name];
  //   return await userModel.updateData(v);
  // }

  static async findBySerialNumber(data) {
    return await userModel.findBySerialNumber(data);
  }
  static async findProcessNameBySerialNumber(data) {
    return await userModel.findProcessNameBySerialNumber(data);
  }
}

module.exports = usersService;

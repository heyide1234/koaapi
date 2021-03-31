const userModel = require("../../../lib/batching.js");

class usersService {
  // static async findAll() {
  //   return await userModel.findAllData();
  // }
  // static async insert(data) {
  //   let v = [data.name, data.pwd, data.sex, data.role, new Date()];
  //   return await userModel.insertData(v);
  // }
  // static async delete(data) {
  //   return await userModel.deleteData(data.name);
  // }
  // static async update(data) {
  //   let v = [data.age, data.name];
  //   return await userModel.updateData(v);
  // }
  static async findBySerialNumberAndProcessName(data) {
    return await userModel.findBySerialNumberAndProcessName(data);
  }
  static async insert(data) {
    return await userModel.insert(data);
  }
  static async delete(data) {
    return await userModel.delete(data);
  }
  static async updateStatus(data) {
    return await userModel.updateStatus(data);
  }
}

module.exports = usersService;

const userModel = require("../../../lib/workOrderHead.js");

class usersService {
  //   static async findAll() {
  //     return await userModel.findAllData();
  //   }
  //   static async insert(data) {
  //     let v = [data.name, data.pwd, data.sex, data.role, new Date()];
  //     return await userModel.insertData(v);
  //   }
  //   static async delete(data) {
  //     return await userModel.deleteData(data.name);
  //   }
  //   static async update(data) {
  //     let v = [data.age, data.name];
  //     return await userModel.updateData(v);
  //   }
  static async delete(data) {
    return await userModel.delete(data);
  }
  static async update(data) {
    return await userModel.update(data);
  }
  static async insert(data) {
    return await userModel.insert(data);
  }

  // static async findBySerialNumber() {
  //   return await userModel.findBySerialNumber();
  // }
  static async findByPageNum(num) {
    return await userModel.findByPageNum(num);
  }

  static async getpage() {
    return await userModel.getpage();
  }
}

module.exports = usersService;

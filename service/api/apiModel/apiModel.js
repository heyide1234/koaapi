const apiModel = require("../../../lib/apiModel.js");

class apiService {
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
    return await apiModel.delete(data);
  }
  static async deleteByWhere(data) {
    return await apiModel.deleteByWhere(data);
  }
  
  static async update(data) {
    return await apiModel.update(data);
  }
  static async updateByWhere(data) {
    return await apiModel.updateByWhere(data);
  }

  static async insert(data) {
    return await apiModel.insert(data);
  }

  // static async findBySerialNumber() {
  //   return await userModel.findBySerialNumber();
  // }
  static async findByPageNum(param) {
    return await apiModel.findByPageNum(param);
  }

  static async getpage(param) {
    return await apiModel.getpage(param);
  }

  static async find(param) {
    return await apiModel.find(param);
  }
}

module.exports = apiService;

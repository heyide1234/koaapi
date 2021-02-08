const service = require("../../../service/api/apiModel/apiModel");
const fs = require("fs");

class apiController {
  // static async find(ctx) {
  //   ctx.body = await service.findAll();
  // }
  // static async insert(ctx) {
  //   ctx.body = await service.insert(ctx.request.body);
  // }
  // static async delete(ctx) {
  //   ctx.body = await service.delete(ctx.request.body);
  // }
  // static async update(ctx) {
  //   ctx.body = await service.update(ctx.request.body);
  // }
  static async delete(ctx) {
    ctx.body = await service.delete(ctx.request.body);
  }
  static async deleteByWhere(ctx) {
    ctx.body = await service.deleteByWhere(ctx.request.body);
  }
  static async update(ctx) {
    ctx.body = await service.update(ctx.request.body);
  }

  static async updateByWhere(ctx) {
    ctx.body = await service.updateByWhere(ctx.request.body);
  }

  static async insert(ctx) {
    ctx.body = await service.insert(ctx.request.body);
  }

  static async findByPageNum(ctx) {
    ctx.body = await service.findByPageNum(ctx.request.query);
  }

  static async getpage(ctx) {
    ctx.body = await service.getpage(ctx.request.query);
  }

  static async find(ctx) {
    ctx.body = await service.find(ctx.request.query);
  }


  static async upload(ctx) {
    console.log("cts=", ctx.request.file)
    // // 上传单个文件
    // const file = ctx.request.files.file; // 获取上传文件
    // // 创建可读流
    // const reader = fs.createReadStream(file.path);
    // let filePath = `C:/Resources/Camy/Fujian/${file.name}`;
    // // 创建可写流
    // const upStream = fs.createWriteStream(filePath);
    // // 可读流通过管道写入可写流
    // reader.pipe(upStream);
    ctx.body = "上传成功！";
  }
}

module.exports = apiController;

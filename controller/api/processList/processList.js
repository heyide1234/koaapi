const service = require("../../../service/api/processList/processList");

class usersController {
  // static async find(ctx) {
  //   ctx.body = await service.findAll();
  // }
  static async insert(ctx) {
    ctx.body = await service.insert(ctx.request.body);
  }
  // static async delete(ctx) {
  //   ctx.body = await service.delete(ctx.request.body);
  // }
  // static async update(ctx) {
  //   ctx.body = await service.update(ctx.request.body);
  // }
  static async findBySerialNumber(ctx) {
    ctx.body = await service.findBySerialNumber(ctx.request.query);
  }
  static async findProcessNameBySerialNumber(ctx) {
    ctx.body = await service.findProcessNameBySerialNumber(ctx.request.query);
  }
}

module.exports = usersController;

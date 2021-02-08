const service = require("../../../service/api/batching/batching");

class usersController {
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
  static async findBySerialNumberAndProcessName(ctx) {
    ctx.body = await service.findBySerialNumberAndProcessName(
      ctx.request.query
    );
  }
  static async insert(ctx) {
    console.log("---进错了1---");
    ctx.body = await service.insert(ctx.request.body);
  }
  static async delete(ctx) {
    ctx.body = await service.delete(ctx.request.body);
  }

  static async updateStatus(ctx) {
    ctx.body = await service.updateStatus(ctx.request.body);
  }
}

module.exports = usersController;

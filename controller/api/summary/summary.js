const service = require("../../../service/api/summary/summary");

class usersController {
  // static async find(ctx) {
  //   ctx.body = await service.findAll();
  // }

  // static async delete(ctx) {
  //   ctx.body = await service.delete(ctx.request.body);
  // }
  // static async update(ctx) {
  //   ctx.body = await service.update(ctx.request.body);
  // }
  static async findsummary(ctx) {
    ctx.body = await service.findsummary(ctx.request.query);
  }
}

module.exports = usersController;

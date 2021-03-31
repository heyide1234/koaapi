const service = require("../../../service/api/user/user");

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

  static async insert(ctx) {
    ctx.body = await service.insert(ctx.request.body);
  }

  static async findNameByUserNameAndPassword(ctx) {
    ctx.body = await service.findNameByUserNameAndPassword(ctx.request.query);
  }
}

module.exports = usersController;

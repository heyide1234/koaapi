const router = require("koa-router")();
const controller = require("../../../controller/api/workOrderHead/workOrderHead");

router.prefix("/api");

router.get("/", async (ctx, next) => {
  ctx.body = "apis";
});

router.post("/workOrderHead/delete", controller.delete);

router.post("/workOrderHead/update", controller.update);

router.post("/workOrderHead/insert", controller.insert);

router.get("/workOrderHead/findByPageNum", controller.findByPageNum);

router.get("/workOrderHead/getpage", controller.getpage);

module.exports = router;

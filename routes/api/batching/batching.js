const router = require("koa-router")();
const controller = require("../../../controller/api/batching/batching");

router.prefix("/api");

// router.get("/", async (ctx, next) => {
//   ctx.body = "api";
// });

// router.get("/find", controller.find);

// router.post("/insert", controller.insert);

// router.delete("/delete", controller.delete);

// router.put("/update", controller.update);
router.get(
  "/batching/findBySerialNumberAndProcessName",
  controller.findBySerialNumberAndProcessName
);
router.post("/batching/insert", controller.insert);

router.post("/batching/delete", controller.delete);

router.post("/batching/updateStatus", controller.updateStatus);

module.exports = router;

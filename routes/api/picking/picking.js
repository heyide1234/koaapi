const router = require("koa-router")();
const controller = require("../../../controller/api/picking/picking");

router.prefix("/api");

// router.get("/", async (ctx, next) => {
//   ctx.body = "api";
// });

// router.get("/find", controller.find);

// router.post("/insert", controller.insert);

// router.delete("/delete", controller.delete);

// router.put("/update", controller.update);
router.post("/picking/insert", controller.insert);

router.post("/picking/delete", controller.delete);

router.post("/picking/updateStatus", controller.updateStatus);

router.get(
  "/picking/findBySerialNumberAndProcessName",
  controller.findBySerialNumberAndProcessName
);

module.exports = router;

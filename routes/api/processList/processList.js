const router = require("koa-router")();
const controller = require("../../../controller/api/processList/processList");

router.prefix("/api");

// router.get("/", async (ctx, next) => {
//   ctx.body = "api";
// });

// router.get("/find", controller.find);

// router.post("/insert", controller.insert);

// router.delete("/delete", controller.delete);

// router.put("/update", controller.update);
router.post("/processList/insert", controller.insert);
router.get("/processList/findBySerialNumber", controller.findBySerialNumber);
router.get(
  "/processList/findProcessNameBySerialNumber",
  controller.findProcessNameBySerialNumber
);

module.exports = router;

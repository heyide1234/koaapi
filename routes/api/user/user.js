const router = require("koa-router")();
const controller = require("../../../controller/api/user/user");

router.prefix("/api");

// router.get("/find", controller.find);

// router.post("/insert", controller.insert);

// router.delete("/delete", controller.delete);

// router.put("/update", controller.update);

router.get(
  "/user/findNameByUserNameAndPassword",
  controller.findNameByUserNameAndPassword
);

module.exports = router;

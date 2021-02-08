const router = require("koa-router")();
const controller = require("../../../controller/api/summary/summary");

router.prefix("/api");

// router.get("/find", controller.find);

// router.post("/insert", controller.insert);

// router.delete("/delete", controller.delete);

// router.put("/update", controller.update);

router.get("/summary/findsummary", controller.findsummary);

module.exports = router;

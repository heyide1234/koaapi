const router = require("koa-router")();
const controller = require("../../../controller/api/apiModel/apiModel");
const fs = require("fs");

router.prefix("/api");
/////////---事务---///////////
const salesOrderTransaction = require("../../../lib/transaction/salesOrderTransaction");
////////////
router.get("/transaction/salesOrderProcessTransaction", salesOrderTransaction.salesOrderProcessTransaction);

//////////////////////////////
module.exports = router;

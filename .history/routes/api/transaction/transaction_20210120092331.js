const router = require("koa-router")();

router.prefix("/api");
/////////---事务---///////////
const salesOrderTransaction = require("../../../lib/transaction/salesOrderTransaction");
////////////
router.get("/transaction/salesOrderProcessTransaction", salesOrderTransaction.salesOrderProcessTransaction);

//////////////////////////////
module.exports = router;

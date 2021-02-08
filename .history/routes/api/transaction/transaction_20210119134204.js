const router = require("koa-router")();
const controller = require("../../../controller/api/apiModel/apiModel");
const fs = require("fs");

router.prefix("/api");
/////////---事务---///////////
const testTransaction = require("../../../lib/transaction/transaction1");
//
router.get("/transaction/finds", testTransaction.userTransaction);

//////////////////////////////
module.exports = router;

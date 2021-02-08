const router = require("koa-router")();
const controller = require("../../../controller/api/apiModel/apiModel");
const fs = require("fs");

router.prefix("/api");
router.get("/", async (ctx, next) => {
  ctx.body = "apis";
});
//根据条件删除
router.post("/apiModel/deleteByWhere", controller.deleteByWhere);
//根据条件删除
router.post("/apiModel/delete", controller.delete); //test
//根据ID修改
router.post("/apiModel/update", controller.update);
//根据条件修改
router.post("/apiModel/updateByWhere", controller.updateByWhere);
//新增
router.post("/apiModel/insert", controller.insert);
//根据skip数目实现分页查询
router.get("/apiModel/findByPageNum", controller.findByPageNum);
//获取总条数
router.get("/apiModel/getpage", controller.getpage);
//查询
router.get("/apiModel/find", controller.find);
//////////////////////////////
/////////---事务---///////////
const salesOrderTransaction = require("../../../lib/transaction/salesOrderTransaction");
const materialPlanTransaction = require("../../../lib/transaction/materialPlanTransaction");
const purchaseTransaction = require("../../../lib/transaction/purchaseTransaction");
const IntransitOrderTransaction = require("../../../lib/transaction/IntransitOrderTransaction")
const IncomingCheckTransaction = require("../../../lib/transaction/IncomingCheckTransaction")
const ReturnOrderTransaction = require("../../../lib/transaction/ReturnOrderTransaction")
const WarehousingTransaction = require("../../../lib/transaction/WarehousingTransaction")
const ManufacturingTransaction = require("../../../lib/transaction/ManufacturingTransaction")
const MaterialZKByProduct = require("../../../lib/transaction/MaterialZKByProduct")



//订单流程及相关推送
router.post("/transaction/salesOrderProcessTransaction", salesOrderTransaction.salesOrderProcessTransaction);
//物料展开
router.post("/transaction/materialPlanZKTransaction", materialPlanTransaction.materialPlanZKTransaction);
//根据物料展开添加到物料计划需求中
router.post("/transaction/materialPlanADDTransaction", materialPlanTransaction.materialPlanADDTransaction);
//根据计划物料数和盘盈数计算实际需求数
router.post("/transaction/materialPlanYYBTransaction", materialPlanTransaction.materialPlanYYBTransaction);
//计算出采购单号
router.post("/transaction/JSCGDNOTransaction", purchaseTransaction.JSCGDNOTransaction);
//生成采购单
router.post("/transaction/SCCGDTransaction", purchaseTransaction.SCCGDTransaction);
//生成材料质检单
router.post("/transaction/CLADDZJDTransaction", IntransitOrderTransaction.CLADDZJDTransaction);

//材料检验
router.post("/transaction/IncomingCheckTransaction", IncomingCheckTransaction.IncomingCheckTransaction);
//退货单
router.post("/transaction/ReturnOrderTransaction", ReturnOrderTransaction.ReturnOrderTransaction);
//材料入库单
router.post("/transaction/WarehousingTransaction", WarehousingTransaction.WarehousingTransaction);
//材料出库单
router.post("/transaction/materialDeliveryTransaction", WarehousingTransaction.materialDeliveryTransaction);
//执行计划单
router.post("/transaction/ManufacturingPlanTransaction", ManufacturingTransaction.ManufacturingPlanTransaction);
//根据清单获取最大的物料数
router.post("/transaction/MaterialZK", MaterialZKByProduct.MaterialZK);







//////////////////////////////
module.exports = router;

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
const goodsWarehousingTransaction = require("../../../lib/transaction/goodsWarehousingTransaction")
const salesInvoiceTransaction = require("../../../lib/transaction/salesInvoiceTransaction")
const materialRequisitionTransaction = require("../../../lib/transaction/materialRequisitionTransaction")
const functionPickingTransaction = require("../../../lib/transaction/functionPickingTransaction")
const yybTransaction = require("../../../lib/transaction/yybTransaction")
const stockTransaction = require("../../../lib/transaction/stockTransaction")
const BDHGTransaction = require("../../../lib/transaction/BDHGTransaction")
const ApprovalTransaction = require("../../../lib/transaction/ApprovalTransaction")
const ManufacturingZZTransaction = require("../../../lib/transaction/ManufacturingZZTransaction")




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
//材料出库展开
router.post("/transaction/materialCKZKTransaction", WarehousingTransaction.materialCKZKTransaction);


//材料出库单
router.post("/transaction/materialDeliveryTransaction", WarehousingTransaction.materialDeliveryTransaction);
//执行计划单
router.post("/transaction/ManufacturingPlanTransaction", ManufacturingTransaction.ManufacturingPlanTransaction);
//执行明细
router.post("/transaction/ManufacturingExecutionTransaction", ManufacturingTransaction.ManufacturingExecutionTransaction);
//制造补料
router.post("/transaction/ManufacturingPlanBLTransaction", ManufacturingTransaction.ManufacturingPlanBLTransaction);


//根据清单获取最大的物料数
router.post("/transaction/MaterialZK", MaterialZKByProduct.MaterialZK);
//物料信息更新
router.post("/transaction/materialDetailsReflesh", MaterialZKByProduct.materialDetailsReflesh);



//根据清单获取最大的物料数
router.post("/transaction/diagram", MaterialZKByProduct.diagram);


//成品入库
router.post("/transaction/goodsWarehousingTransaction", goodsWarehousingTransaction.goodsWarehousingTransaction);
//成品出库
router.post("/transaction/goodsDeliveryTransaction", goodsWarehousingTransaction.goodsDeliveryTransaction);

//销售发货单
router.post("/transaction/salesInvoiceTransaction", salesInvoiceTransaction.salesInvoiceTransaction);
//请购发货申请
router.post("/transaction/functionPickingTransaction", functionPickingTransaction.functionPickingTransaction);

router.post("/transaction/RefreshKCTransaction", stockTransaction.RefreshKCTransaction);

//物料请购
router.post("/transaction/materialRequisitionTransaction", materialRequisitionTransaction.materialRequisitionTransaction);

//盈余表操作库存
router.post("/transaction/yybTransaction", yybTransaction.yybTransaction);

//根据库存同步盈余表
router.post("/transaction/YYBREFTransaction", yybTransaction.YYBREFTransaction);

//表单回滚
router.post("/transaction/BDHGTransaction", BDHGTransaction.BDHGTransaction);
// 采购回退
router.post("/transaction/CGHGTransaction", BDHGTransaction.CGHGTransaction);

router.post("/transaction/ApprovalTransaction", ApprovalTransaction.ApprovalTransaction);

router.post("/transaction/ManufacturingZZTransaction", ManufacturingZZTransaction.ManufacturingZZTransaction);











//////////////////////////////
module.exports = router;

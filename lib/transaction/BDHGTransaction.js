const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

class BDHGTransaction {
    static async BDHGTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await BDHG(data.OrderNumber);
        } catch (err) {
            status = false;
            returndata = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status, data: returndata
        };
    }
    static async CGHGTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await CGHG(data.PurchaseNumberId, data.OrderNumber, data.MaterialNumber, data.Number);
        } catch (err) {
            status = false;
            returndata = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status, data: returndata
        };
    }
}
async function BDHG(OrderNumber) {
    console.log("start!!!!!!!")
    //修改订单流程号
    let orders = await apiModel.find({ table: "salesOrder", where: { OrderNumber: OrderNumber } })
    if (orders.length > 0 && orders[0].allowHG == "true") {//当该订单允许回滚时
        //记录盈余表增减记录用与回滚
        let yybjls = await apiModel.find({ table: "YYBJL", where: { OrderNumber: OrderNumber } });
        for (let i = 0; i < yybjls.length; i++) {
            let yybs = await apiModel.find({ table: "YYB", where: { MaterialNumber: yybjls[i].MaterialNumber } });
            let nusd = "0";
            if (yybs.length > 0) {
                nusd = yybs[0].Number;
            }
            await apiModel.updateByWhere({
                table: "YYB", where: { MaterialNumber: yybjls[i].MaterialNumber },
                form: { Number: parseInt(nusd) + parseInt(yybjls[i].Number) + "" }
            });

        }
        await apiModel.deleteByWhere({ table: "YYBJL", where: { OrderNumber: OrderNumber } });
        ///////////
        //删除采购入库前所有该订单号的物料明细
        await apiModel.deleteByWhere({ table: "salesInvoice", where: { OrderNumber: OrderNumber } });//销售发货单
        await apiModel.deleteByWhere({ table: "ManufacturingPlan", where: { OrderNumber: OrderNumber } });//制造执行单
        await apiModel.deleteByWhere({ table: "MaterialDemand", where: { OrderNumber: OrderNumber } });//物料需求单
        await apiModel.deleteByWhere({ table: "PurchaseOrder", where: { OrderNumber: OrderNumber } });//预采购单
        await apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: OrderNumber }, form: { processCode: "1" } });//修改系统订单流程码
        await apiModel.updateByWhere({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber }, form: { status: "0" } });//修改订单明细状态
    }

}
async function CGHG(PurchaseNumberId, OrderNumber, MaterialNumber, Number) {

    let ord = await apiModel.find({ table: "PurchaseOrder", where: { OrderNumber: OrderNumber, MaterialNumber: MaterialNumber } });
    ord[0].PlanNumber = Number;
    ord[0].SurplusDistribution = Number;
    ord[0].status = "0";
    ord[0].PurchaseNumber = "";
    ord[0].Remark = "采购撤回"
    delete ord[0]._id;

    await apiModel.insert({ table: "PurchaseOrder", form: ord[0] });

    await apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: OrderNumber }, form: { processCode: "4" } });
    //删除采购单下的物料
    await apiModel.delete({ table: "IntransitOrder", id: PurchaseNumberId });



}

module.exports = BDHGTransaction;

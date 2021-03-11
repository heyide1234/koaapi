const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

class ManufacturingZZTransaction {
    static async ManufacturingZZTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await ManufacturingZZ();
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
async function ManufacturingZZ() {
    let dts = [{ status: "在制产品" }]
    let res = await apiModel.find({ table: "ManufacturingPlan", where: {} });//制造计划数
    dts[0].ZZJH = 0;
    for (let q = 0; q < res.length; q++) {
        dts[0].ZZJH += parseInt(res[q].Number);
    }
    dts[0].ZZLL = await apiModel.getpage({ table: "ManufacturingExecution", pageWhere: JSON.stringify({ IsDeliverGoods: "制造领料" }) });
    dts[0].ZZZX = await apiModel.getpage({ table: "ManufacturingExecution", pageWhere: JSON.stringify({ IsDeliverGoods: "制造执行" }) });
    dts[0].ZZPJ = await apiModel.getpage({ table: "ManufacturingExecution", pageWhere: JSON.stringify({ IsDeliverGoods: "制造品检" }) });
    dts[0].ZZDRK = await apiModel.getpage({ table: "ManufacturingExecution", pageWhere: JSON.stringify({ IsDeliverGoods: "制造待入库" }) });
    dts[0].ZZYRK = await apiModel.getpage({ table: "ManufacturingExecution", pageWhere: JSON.stringify({ IsDeliverGoods: "制造已入库" }) })

    return dts;
}


module.exports = ManufacturingZZTransaction;

const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

class functionPickingTransaction {
    static async functionPickingTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await functionPicking(data.row, data.form, data.creater, data.creatdate);
        } catch (err) {
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status, data: returndata
        };
    }
}
async function functionPicking(row, form, creater, creatdate) {
    //修改库存待分配数
    apiModel.updateByWhere({ table: "stock", where: { MaterialNumber: row.MaterialNumber }, form: { SYNumber: parseInt(row.Inventory) - parseInt(form.DeliverGoods) + "" } });
    let cds = {
        OrderNumber: row.OrderNumber, //订单编号
        MaterialNumber: row.MaterialNumber, //产品编号
        MaterialName: row.MaterialName, //产品名称
        MaterialPrice: row.MaterialPrice, //产品价格
        CustomerMaterialNumber: row.CustomerMaterialNumber, //客户物料编号
        CustomerMaterialName: row.CustomerMaterialName, //客户物料名称
        Number: form.DeliverGoods, //申请出货数
        status: "0", //状态
        creater: creater, //创建人
        creatdate: creatdate, //创建时间
    };
    //插入出库单
    apiModel.insert({ table: 'goodsDelivery', form: cds });
    let cods = {
        DeliverGoodsTotal:
            parseInt(form.DeliverGoods) + parseInt(row.DeliverGoodsTotal) + "",
        DeliverGoods: form.DeliverGoods,
    };

    //修改当前销售发货单信息
    apiModel.update({ table: "functionPicking", id: row._id, form: cods });
}

module.exports = functionPickingTransaction;

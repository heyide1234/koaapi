
const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });
let dataList = [];//循环存储递归的物料明细
class materialRequisitionTransaction {
    //成品入库
    static async materialRequisitionTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await materialRequisition(data.datas, data.creater, data.creatdate);
        } catch (err) {
            console.log("err====", err)
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
//物料请购
async function materialRequisition(datas, creater, creatdate) {
    for (let i = 0; i < datas.length; i++) {
        //1.盈余产品
        let yyproductinfo = await apiModel.find({ table: "YYB", where: { MaterialNumber: datas[i].MaterialNumber } });
        if (yyproductinfo.length > 0) {
            let tempNum = parseInt(yyproductinfo[0].Number) - parseInt(datas[i].PNum); //盈余表数量-需求数
            let YYBnum = 0;
            if (tempNum >= 0) {//库存足
                datas[i].Number = "0";
                YYBnum = tempNum;
            } else {//库存不足
                datas[i].Number = Math.abs(tempNum) + "";
            }
            apiModel.updateByWhere({ table: "YYB", where: { MaterialNumber: datas[i].MaterialNumber }, form: { Number: YYBnum + "" } });
        }
        apiModel.update({ table: "salesOrderDetail", id: datas[i]._id, Number: datas[i].Number });
    }
    ///////////////////
    let dt = {
        OrderNumber: row.OrderNumber, //订单编号
        MaterialNumber: row.MaterialNumber, //产品编号
        MaterialName: row.MaterialName, //产品名称
        MaterialPrice: row.MaterialPrice, //产品价格
        Number: row.PNum, //应出数量
        DeliverGoodsTotal: "0", //实际出货总数
        DeliverGoods: "0", //实际出货数
        Inventory: "0", //库存数
        status: "0", //状态
        creater: row.creater, //创建人
        creatdate: row.creatdate, //创建时间
    };
    //添加功能领料单
    apiModel.insert({ table: 'functionPicking', form: dt });
    //修改销售单明细状态为1（不可编辑）
    apiModel.update({ table: "salesOrderDetail", id: ids, form: row });
}

module.exports = materialRequisitionTransaction;


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
        YYBstate(JSON.parse(JSON.stringify(datas[i])))
        //2.添加到功能领料
        addFunction(JSON.parse(JSON.stringify(datas[i])), creater, creatdate);



    }

}
///////////////////
async function YYBstate(row) {
    let yyproductinfo = await apiModel.find({ table: "YYB", where: { MaterialNumber: row.MaterialNumber } });
    if (yyproductinfo.length > 0) {
        let tempNum = parseInt(yyproductinfo[0].Number) - parseInt(row.PNum); //盈余表数量-需求数
        let YYBnum = 0;
        if (tempNum >= 0) {//库存足
            row.Number = "0";
            YYBnum = tempNum;
        } else {//库存不足
            row.Number = Math.abs(tempNum) + "";
        }
        apiModel.updateByWhere({ table: "YYB", where: { MaterialNumber: row.MaterialNumber }, form: { Number: YYBnum + "" } });
    }
}
async function addFunction(row, creater, creatdate) {
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
        creater: creater, //创建人
        creatdate: creatdate, //创建时间
    };
    //添加功能领料单
    apiModel.insert({ table: 'functionPicking', form: dt });
}
module.exports = materialRequisitionTransaction;

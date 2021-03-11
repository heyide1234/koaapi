
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
            returndata = await materialRequisition(data.datas, data.Purpose, data.creater, data.creatdate);
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
async function materialRequisition(datas, Purpose, creater, creatdate) {
    let ddbk = Purpose.indexOf("备库") == -1;
    let ddbks = Purpose.indexOf("成品备库") > -1;

    for (let i = 0; i < datas.length; i++) {
        //1.盈余产品
        let yyproductinfo = [];
        if (ddbk) yyproductinfo = await apiModel.find({ table: "YYB", where: { MaterialNumber: datas[i].MaterialNumber } });
        if (yyproductinfo.length > 0) {
            let tempNum = parseInt(yyproductinfo[0].Number) - parseInt(datas[i].PNum); //盈余表数量-需求数
            let YYBnum = 0;
            let ccc = '0';
            if (tempNum >= 0) {//库存足
                datas[i].Number = "0";
                YYBnum = tempNum;
                ccc = datas[i].PNum;
            } else {//库存不足
                datas[i].Number = Math.abs(tempNum) + "";
                ccc = yyproductinfo[0].Number;
            }
            if (ddbk) await apiModel.updateByWhere({ table: "YYB", where: { MaterialNumber: datas[i].MaterialNumber }, form: { Number: YYBnum + "" } });
            if (ddbk) await apiModel.insert({ table: 'YYBJL', form: { OrderNumber: datas[0].OrderNumber, MaterialNumber: datas[0].MaterialNumber, Number: "-" + ccc, TotalAmount: "" } });
        }
        await apiModel.update({ table: "salesOrderDetail", id: datas[i]._id, form: { Number: datas[i].Number, status: "1" } });
        //2.添加到功能领料
        let dt = {
            OrderNumber: datas[i].OrderNumber, //订单编号
            MaterialNumber: datas[i].MaterialNumber, //产品编号
            MaterialName: datas[i].MaterialName, //产品名称
            MaterialPrice: datas[i].MaterialPrice, //产品价格
            Number: datas[i].PNum, //应出数量
            DeliverGoodsTotal: "0", //实际出货总数
            DeliverGoods: "0", //实际出货数
            Inventory: "0", //库存数
            status: "0", //状态
            creater: creater, //创建人
            creatdate: creatdate, //创建时间
        };
        if (ddbk) await apiModel.insert({ table: 'functionPicking', form: dt });

        if (ddbks) doManufacturingPlan(datas[i], Purpose, creater, creatdate);//增加制造执行单

    }
    //3推单
    let stt = "8";
    datas.forEach((item) => {
        if (item.Number != "0") {
            stt = "2";
        }
    });
    apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: datas[0].OrderNumber }, form: { processCode: stt } });
}
//退送制造计划单
function doManufacturingPlan(dt, Purpose, creater, creatdate) {
    if (parseInt(dt.Number) == 0) return;
    let v = {
        OrderNumber: dt.OrderNumber, //订单编号
        MaterialNumber: dt.MaterialNumber, //产品编号
        MaterialName: dt.MaterialName, //产品名称
        Number: dt.Number, //产品数量
        SurplusNumber: dt.Number, //剩余分配数量
        Thumbnail: dt.Thumbnail,
        MaterialSpec: dt.MaterialSpec,
        Purpose: Purpose,
        status: "0", //状态1
        creater: creater, //创建人
        creatdate: creatdate, //创建时间
    };
    apiModel.insert({ table: 'ManufacturingPlan', form: v });
}
///////////////////

module.exports = materialRequisitionTransaction;

const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

let id1 = null;
let form1 = null;
let returndata = null;
let loginName = null;//创建人
let times = null;//当前时间
class salesOrderTransaction {
    static async salesOrderProcessTransaction(ctx) {
        let data = null;
        let returnData = null;
        let status = true;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        loginName = data.loginName;
        times = data.times;
        try {
            await tdprocess(data.datas, data.OrderNumber)
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

async function tdprocess(datas, OrderNumber) {
    //库存盈余表检查
    await yyFind(datas, OrderNumber); //
    //检测是否全部完成，进入推单模式
    let stt = "8";
    datas.forEach((item) => {
        if (item.Number != "0") {
            stt = "2";
        }
    });
    //修改销售订单的流程码
    apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: OrderNumber }, form: { processCode: stt } });
    // //循环添加销售发货单和当前销售单明细状态
    let ddf = JSON.parse(JSON.stringify(datas));
    //将每个产品进行对应表单操作
    for (let j1 = 0; j1 < ddf.length; j1++) {
        id1 = ddf[j1]._id;
        delete ddf[j1]._id;

        apiModel.update({ table: "salesOrderDetail", id: id1, form: ddf[j1] });

        handleCirculation(ddf[j1]);//增加销售发货单
        doManufacturingPlan(ddf[j1]);//增加制造执行单
    }
    returndata = { id1: id1 }

}
async function yyFind(data, OrderNumber) {
    for (let i = 0; i < data.length; i++) {
        let num = parseInt(data[i].PNum); //数量
        let productNumber = data[i].MaterialNumber; //产品编码
        //1.查询盈余产品
        let yyproductNum = 0; //该物料编码盈余表信息
        let safetyStockNum = 0;
        let res = await apiModel.find({ table: "YYB", where: { MaterialNumber: productNumber } });
        if (res.length > 0) {
            yyproductNum = parseInt(res[0].Number);
            safetyStockNum = parseInt(res[0].safetyStock);

        }
        // else {
        //     //添加为0的记录
        //     await apiModel.insert({ table: 'YYB', form: { MaterialNumber: productNumber, Number: "0", TotalAmount: "0" } });
        // }
        let tempNum = yyproductNum - parseInt(num); //盈余表数量-需求数
        let JLnum = '0';//记录需求减去盈余数
        let YYBnum = 0;
        if (tempNum >= safetyStockNum) {//库存足
            data[i].Number = "0";
            YYBnum = tempNum;
            JLnum = num;
        } else {//库存不足
            data[i].Number = Math.abs(tempNum - safetyStockNum) + "";
            JLnum = yyproductNum;
            YYBnum = safetyStockNum;
        }

        apiModel.updateByWhere({ table: "YYB", where: { MaterialNumber: productNumber }, form: { Number: YYBnum + "", TotalAmount: parseFloat(res[0].TotalAmount) / yyproductNum * YYBnum + "" } });
        apiModel.update({ table: "salesOrderDetail", id: data[i]._id, form: { Number: data[i].Number } });
        //记录盈余表增减记录用与回滚
        apiModel.insert({ table: 'YYBJL', form: { OrderNumber: OrderNumber, MaterialNumber: productNumber, Number: JLnum, TotalAmount: parseFloat(res[0].TotalAmount) / yyproductNum * JLnum + "" } });
    }
}
function handleCirculation(row) {
    row.status = "1";
    row.creater = loginName;
    row.creatdate = times;
    let dt = {
        MaterialSpec: row.MaterialSpec,
        OrderNumber: row.OrderNumber, //订单编号
        MaterialNumber: row.MaterialNumber, //产品编号
        MaterialName: row.MaterialName, //产品名称
        MaterialPrice: row.MaterialPrice, //产品价格
        Number: row.PNum, //应出数量
        CustomerMaterialNumber: row.CustomerMaterialNumber, //客户物料编号
        CustomerMaterialName: row.CustomerMaterialName, //客户物料名称
        DeliverGoodsTotal: "0", //实际出货总数
        DeliverGoods: "0", //实际出货数
        Inventory: "0", //库存数
        status: "0", //状态
        creater: loginName, //创建人
        creatdate: times, //创建时间
    };
    //添加销售发货单
    apiModel.insert({ table: 'salesInvoice', form: dt });
}

//退送制造计划单
function doManufacturingPlan(dt) {
    if (parseInt(dt.Number) == 0) return;
    let v = {
        OrderNumber: dt.OrderNumber, //订单编号
        MaterialNumber: dt.MaterialNumber, //产品编号
        MaterialName: dt.MaterialName, //产品名称
        Number: dt.Number, //产品数量
        SurplusNumber: dt.Number, //剩余分配数量
        Thumbnail: dt.Thumbnail,
        MaterialSpec: dt.MaterialSpec,
        status: "0", //状态1
        creater: loginName, //创建人
        creatdate: times, //创建时间
    };
    apiModel.insert({ table: 'ManufacturingPlan', form: v });
}

module.exports = salesOrderTransaction;

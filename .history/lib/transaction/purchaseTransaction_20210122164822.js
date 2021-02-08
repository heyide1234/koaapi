const DB = require("../mongodb");

// DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
// DB.queryNum(param.table, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
// DB.queryByPageNum(param.table, param.PageNum, param.sortJson, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
// DB.insert(data.table, data.form);
// DB.deleteOne(data.table, { _id: DB.getObjectID(data.id) });
// DB.delete(data.table, data.where);
// DB.update(data.table, { _id: DB.getObjectID(data.id) }, data.form);
// DB.update(data.table, data.where, data.form);

let id1 = null;
let form1 = null;
let returndata = null;
let loginName = null;//创建人
let times = null;//当前时间
class salesOrderTransaction {
    static async JSCGDNOTransaction(ctx) {
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
    await yyFind(datas); //
    //检测是否全部完成，进入推单模式
    let stt = "8";
    datas.forEach((item) => {
        if (item.Number != "0") {
            stt = "2";
        }
    });
    //修改销售订单的流程码
    DB.update("salesOrder", { OrderNumber: OrderNumber }, { processCode: stt })
    // //循环添加销售发货单和当前销售单明细状态
    let ddf = JSON.parse(JSON.stringify(datas));
    //将每个产品进行对应表单操作
    for (let j1 = 0; j1 < ddf.length; j1++) {
        id1 = ddf[j1]._id;
        delete ddf[j1]._id;
        DB.update("salesOrderDetail", { _id: DB.getObjectID(id1) }, ddf[j1]); //修改销售单明细状态为1（不可编辑）
        handleCirculation(ddf[j1]);//增加销售发货单
        doManufacturingPlan(ddf[j1]);//增加制造执行单
    }
    returndata = { id1: id1 }

}
async function yyFind(data) {
    for (let i = 0; i < data.length; i++) {
        let num = parseInt(data[i].PNum); //数量
        let productNumber = data[i].MaterialNumber; //产品编码
        //1.查询盈余产品
        let yyproductNum = null; //该物料编码盈余表信息
        let res = await DB.find("YYB", JSON.stringify({ MaterialNumber: productNumber }), JSON.stringify({ _id: -1 }));
        if (res.length > 0) {
            yyproductNum = parseInt(res[0].Number);
        }
        let tempNum = yyproductNum - parseInt(num); //盈余表数量-需求数
        let YYBnum = 0;
        if (tempNum >= 0) {
            //库存足
            data[i].Number = "0";
            YYBnum = tempNum;
        } else {
            //库存不足
            data[i].Number = Math.abs(tempNum) + "";
        }
        await DB.update("YYB", { MaterialNumber: productNumber }, { Number: YYBnum + "" })
        await DB.update("salesOrderDetail", { _id: DB.getObjectID(data[i]._id) }, { Number: data[i].Number })
    }
}
function handleCirculation(row) {
    row.status = "1";
    row.creater = loginName;
    row.creatdate = times;
    let dt = {
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
    DB.insert("salesInvoice", dt)
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
        status: "1", //状态1
        creater: loginName, //创建人
        creatdate: times, //创建时间
    };
    DB.insert("ManufacturingPlan", v)
}

module.exports = salesOrderTransaction;

const { Db } = require("mongodb");
const DB = require("../mongodb");
class salesOrderTransaction {
    static async salesOrderProcessTransaction(ctx) {
        let data = null;
        let returnData = null;
        let status = true;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        let loginName = data.loginName;
        let times = data.times;
        try {
            returnData = await tdprocess(data.datas, data.OrderNumber)
            console.log(4);
        } catch (err) {
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }
        ctx.body = { status: status, data: returnData };
    }
}
//start 。。。ing
//传出到vue this属性
let id1 = null;
let form1 = null;
let loginName = null;
let times = null;
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
    console.log(1);
    //订单编号
    await getProcessState(
        OrderNumber,
        "salesOrderDetail",
        "-1",
        stt
    );
    console.log(2);
    // //循环添加销售发货单和当前销售单明细状态
    let ddf = JSON.parse(JSON.stringify(datas));

    for (let j1 = 0; j1 < ddf.length; j1++) {
        console.log(1234);
        handleCirculation(ddf[j1]);
        doManufacturingPlan(ddf[j1]);
    }
    console.log(3);
    return {
        id1: id1,
        form1: form1
    }

}
function getProcessState(orderNumber, table, statusing, processCode) {
    ///进入推单模式
    DB.update("salesOrder", { OrderNumber: orderNumber }, { processCode: processCode })
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

async function YYBfind(productNumber) {
    console.log(2);
    let temp = 0;
    let res = await DB.find("YYB", { MaterialNumber: productNumber }, JSON.parse('{ _id: -1 }'));
    console.log(31);
    if (res.length > 0) {
        temp = parseInt(res[0].Number);
    }
    return temp;
}

function handleCirculation(row) {
    id1 = { id: row._id };
    delete row._id;
    row.status = "1";
    row.creater = loginName;
    row.creatdate = times;
    form1 = row;
    console.log(12345);
    DB.update("salesOrderDetail", { _id: DB.getObjectID(id1.id) }, form1); //修改销售单明细状态为1（不可编辑）

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
    console.log(123456);
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
// function insertSalesInvoice(v) {
//     this.$https({
//         method: "post",
//         url: "/api/apiModel/insert",
//         data: {
//             table: "salesInvoice",
//             form: v,
//         },
//     })
//         .then((res) => console.log(res))
//         .catch((err) => console.log(err));
// }







































module.exports = salesOrderTransaction;

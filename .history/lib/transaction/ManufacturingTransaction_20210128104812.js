// const DB = require("../mongodb");
const apiModel = require("../apiModel.js");




// DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
// DB.queryNum(param.table, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
// DB.queryByPageNum(param.table, param.PageNum, param.sortJson, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
// DB.insert(data.table, data.form);
// DB.deleteOne(data.table, { _id: DB.getObjectID(data.id) });
// DB.delete(data.table, data.where);
// DB.update(data.table, { _id: DB.getObjectID(data.id) }, data.form);
// DB.update(data.table, data.where, data.form);

// let id1 = null;
// let form1 = null;
// let loginName = null;//创建人
// let times = null;//当前时间

let data = null;//请求的数据
let returnData = null;//返回的数据
let status = false;//记录当前返回值状态
let tableDataModel = [];
let dataList = [];//循环存储递归的物料明细
let OrderNumber = "";//订单号
class Manufacturing {
    //物料展开
    static async ManufacturingPlanTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            OrderNumber = data.OrderNumber;
            await ManufacturingPlan(data.row, data.saveNum, data.LLNumber, data.creater, data.creatdate);
            status = true;
        } catch (err) {
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;
        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status
        };
    }
}
////////////执行计划单//////////////
async function ManufacturingPlan(row, saveNum, LLNumber, creater, creatdate) {
    //生成单个产品物料明细模板
    await productionModel(row);//tableDataModel
    let t = await getSn(); //产品SN typeOf int
    for (let i = 0; i < parseInt(LLNumber); i++) {
        let df = {//产品sn模板
            SN: "", //SN
            OrderNumber: row.OrderNumber, //订单编号
            MaterialNumber: row.MaterialNumber, //产品编号
            MaterialName: row.MaterialName, //产品名称
            Thumbnail: row.Thumbnail, //
            MaterialSpec: row.MaterialSpec, //
            Number: "1", //产品数量
            status: "0", //状态
            creater: creater, //创建人
            creatdate: creatdate, //创建时间
        };
        df.SN = t + i + "";
        df.IsDeliverGoods = "0";
        await apiModel.insert({ table: 'ManufacturingExecution', form: df });
        await insertByManufactringExecutionDetail(
            df.SN,
            row.OrderNumber,
            creater
        );
    }
    //修改执行计划单的状态
    if (saveNum > 0) {
        apiModel.update({ table: "ManufacturingPlan", id: row._id, form: { SurplusNumber: saveNum + "", status: "0" } });
    } else if (saveNum == 0) {
        apiModel.update({ table: "ManufacturingPlan", id: row._id, form: { SurplusNumber: "0", status: "1" } });
    }
    ///////
    let df1 = {
        OrderNumber: row.OrderNumber, //订单编号
        Purpose: "生产制造",
        MaterialNumber: row.MaterialNumber, //产品编号
        MaterialName: row.MaterialName, //产品名称
        Number: LLNumber, //产品数量
        Proportioner: "", //配料人
        CLCKNumber: "", //材料出库单号
        status: "0", //状态
        creater: creater, //创建人
        creatdate: creatdate, //创建时间
    };
    //插入材料出库单
    apiModel.insert({ table: 'materialDelivery', form: df1 });
    //修改库存数状态
    let dat = await apiModel.find({ table: "stock", where: { MaterialNumber: row.MaterialNumber, } });
    if (dat.length > 0) {
        let cc = parseInt(dat[0].SYNumber) - parseInt(LLNumber) + "";
        apiModel.updateByWhere({ table: 'stock', where: { MaterialNumber: row.MaterialNumber }, form: { SYNumber: cc } });
    }


}
//单个产品模板
async function productionModel(row) {
    let datas1 = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: row.MaterialNumber } });
    let cds = JSON.parse(JSON.stringify(row));
    cds.MaterialSpec = datas1[0].MaterialSpec;
    cds.MaterialTexture = datas1[0].MaterialTexture;
    cds.Company = datas1[0].Company;
    cds.datas1Enclosure = datas1[0].datas1Enclosure;
    cds.Number = "1";//单个产品
    dataList = [];//存储物料明细
    getzk(cds);
    // await sleep(10000);     // 代码暂停
    let flag = true;
    let len = 0
    while (flag) {
        if (dataList.length != len) {
            len = dataList.length;
        } else {
            flag = false;
        }
        await sleep(500);
    }
    tableDataModel = jsNums(dataList, "MaterialNumber", "Number");//去重相加生成单个产品模板
}
async function getSn() {
    let dt = new Date();
    let Y = dt.getFullYear() + "";
    let M = dt.getMonth() + 1 + "";
    let D = dt.getDate() + "";
    if (M.length < 2) M = "0" + M;
    if (D.length < 2) D = "0" + D;
    let nyr = Y + M + D;
    let ces = parseInt(nyr + "000"); //初始SN
    let cdss = { SN: { $regex: nyr + "" } };
    //查询当天存在相同料号SN
    let cgd = await apiModel.find({ table: "ManufacturingExecution", where: cdss });

    if (cgd.length > 0) {
        cgd.sort((a, b) => {
            return parseInt(a.SN) - parseInt(b.SN);
        });
        ces = parseInt(cgd[cgd.length - 1].SN); //最高SN
    }
    let SN = ces + 1;
    return SN;
}
//展开BOM
async function getzk(product, n1 = "1") {
    let n = parseInt(product.Number) * parseInt(n1) + ""; //当前数
    let products = await apiModel.find({ table: "__materialDetails", dataBase: "base", where: { Parent: product.MaterialNumber } });
    if (products.length > 0) {
        for (let i = 0; i < products.length; i++) {
            await getzk(products[i], n);
        }
    } else {
        product.Number = n;
        product.OrderNumber = OrderNumber;
        dataList.push(product);
        return;
    }
}
//添加sn产品明细
async function insertByManufactringExecutionDetail(SN, OrderNumber, creater) {
    let d = JSON.parse(JSON.stringify(tableDataModel));
    for (let i = 0; i < d.length; i++) {
        delete d[i]._id;
        d[i].SupplierCode = "";
        d[i].ConfirmNumber = "";
        d[i].Picker = creater;
        d[i].OP = "";
        d[i].Operator = "";
        d[i].Checker = "";
        d[i].Remark = "";
        d[i].status = "0";
        d[i].SN = SN;
        d[i].OrderNumber = OrderNumber;
        await apiModel.insert({ table: 'ManufacturingExecutionDetail', form: d[i] });
    }
}
////////////////
/////工具函数//////
///////////////
function sleep(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
function jsNums(arr, ids, attr) {
    //自带去重
    if (arr.length == 1) return arr;
    // debugger;
    arr.sort((a, b) => {
        return parseFloat(a[ids]) - parseFloat(b[ids]);
    });
    let newArr = [];
    let obj = null;
    for (let i = 0; i < arr.length; i++) {
        if (obj == null) {
            obj = arr[i];
        } else {
            if (obj[ids] == arr[i][ids]) {
                obj[attr] = parseFloat(obj[attr]) + parseFloat(arr[i][attr]) + "";
                if (arr.length - 1 == i) newArr.push(obj);
            } else {
                newArr.push(obj);
                obj = arr[i];
                if (arr.length - 1 == i) newArr.push(obj);
            }
        }
    }
    return newArr;
}
module.exports = Manufacturing;

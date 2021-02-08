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
let tableData = [];//返回的数据
let dataList = [];//循环存储递归的物料明细
let ff = false
class materialPlanTransaction {
    //物料展开
    static async materialPlanZKTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            OrderNumber = data.OrderNumber;
            await zkMeterial()

            status = true;
        } catch (err) {
            console.log("err...", err);
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }

        // 代码暂停
        await sleep(10000);
        tableData = jsNums(dataList, "MaterialNumber", "Number");
        console.log("end...");
        ctx.body = {
            status: status, data: tableData, data2: productsh
        };
    }
    //将展开的物料存储到计划物料需求单中
    static async materialPlanADDTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            // console.log("start...");
            await addMeterial(data.datas, data.OrderNumber)

            status = true;
        } catch (err) {
            console.log("err...", err);
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }

        console.log("end...");
        ctx.body = {
            status: status, data: returnData
        };
    }

    //根据计划物料和盘盈仓库数计算出实际需求数
    static async materialPlanYYBTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            // console.log("start...");
            await addMeterial(data.datas, data.OrderNumber)

            status = true;
        } catch (err) {
            console.log("err...", err);
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }

        console.log("end...");
        ctx.body = {
            status: status, data: returnData
        };
    }
}

let OrderNumber = "";//订单号
let productsh = null;
async function zkMeterial() {
    //销售订单明细（产品list）
    productsh = await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
    dataList = [];//存储物料明细
    for (let i = 0; i < productsh.length; i++) {
        if (productsh[i].Number == "0") continue;
        //查询出每个产品的详细信息
        let datas1 = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: productsh[i].MaterialNumber } });
        let cds = productsh[i];
        cds.MaterialSpec = datas1[0].MaterialSpec;
        cds.MaterialTexture = datas1[0].MaterialTexture;
        cds.Company = datas1[0].Company;
        cds.datas1Enclosure = datas1[0].datas1Enclosure;
        getzk(cds);
    }
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
//////////////////////////
async function addMeterial(datas, orderNumber) {

    for (let i = 0; i < datas.length; i++) {
        delete datas[i]._id;
        datas[i].status = "0";
        await apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
    }
    ///进入推单模式
    apiModel.updateByWhere({ table: 'salesOrder', where: { OrderNumber: orderNumber }, form: { processCode: "3" } });
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
module.exports = materialPlanTransaction;

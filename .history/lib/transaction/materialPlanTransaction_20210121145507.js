// const DB = require("../mongodb");
// const apiModel = require("../apiModel.js");
const BASEDB = require("../mongodb/baseIndex");
const DB = require("../mongodb/index");

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
let returndata = null;
// let loginName = null;//创建人
// let times = null;//当前时间

let data = null;//请求的数据
let returnData = null;//返回的数据
let status = false;//记录当前返回值状态
let tableData = null;//返回的数据
let dataList = null;//循环存储递归的物料明细
class materialPlanTransaction {
    //物料展开
    static async materialPlanTransactionZKTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            console.log("start...");
            await zkMeterial(data.OrderNumber)
            console.log("end...");
            status = true;
        } catch (err) {
            console.log("err...", err);
            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status, data: tableData
        };
    }
}

async function zkMeterial(OrderNumbers) {
    //销售订单明细（产品list）
    let wheres = JSON.stringify({ OrderNumber: OrderNumbers });
    let sorts = JSON.stringify({ _id: -1 })
    let res = await DB.find("salesOrderDetail", wheres, sorts);
    console.log("2222", typeof wheres, typeof sorts);

    // for (let i = 0; i < cdew.length; i++) {
    //     console.log("333")
    //     if (cdew[i].Number == "0") continue;
    //     //查询出每个产品的详细信息
    //     let datas1 = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: cdew[i].MaterialNumber } });
    //     let cds = cdew[i];
    //     console.log("444", datas1, cdew[i].MaterialNumber)
    //     cds.MaterialSpec = datas1[0].MaterialSpec;
    //     cds.MaterialTexture = datas1[0].MaterialTexture;
    //     cds.Company = datas1[0].Company;
    //     cds.datas1Enclosure = datas1[0].datas1Enclosure;
    //     getzk(cds);
    // }
    // console.log("999", dataList)
    // let len = 0;
    // let timer = setInterval(() => {
    //     if (len == dataList.length) {
    //         clearInterval(timer);
    //         tableData = jsNums(dataList, "MaterialNumber", "Number");//去掉重复的物料编码
    //         tableData.forEach((element) => {
    //             element.OrderNumber = OrderNumbers;
    //         });
    //         ctx.body = {
    //             status: true, data: tableData
    //         };
    //     } else {
    //         len = dts.length;
    //     }
    // }, 500);

}


//展开BOM
async function getzk(product, n1 = "1") {
    let n = parseInt(product.Number) * parseInt(n1) + ""; //当前数
    let products = await apiModel.find({ table: "__materialDetails", dataBase: "base", where: { Parent: product.MaterialNumber }, sortJson: { _id: -1 } });
    // let mums = this.datas;
    if (products.length > 0) {
        for (let i = 0; i < products.length; i++) {
            getzk(products[i], n);
        }
    } else {
        product.Number = n;
        dataList.push(product);
        return;
    }
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

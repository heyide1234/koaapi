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
let returndata = null;
// let loginName = null;//创建人
// let times = null;//当前时间

let data = null;//请求的数据
let returnData = null;//返回的数据
let status = false;//记录当前返回值状态
class materialPlanTransaction {
    //物料展开
    static async materialPlanTransactionZKTransaction(ctx) {

        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            await zkMeterial(ctx, data.OrderNumber)
            status = true;
        } catch (err) {

            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }

    }
}
let tableData = null;
async function zkMeterial(ctx, OrderNumbers) {
    //销售订单明细（产品list）
    let cdew = await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumbers } });


    dts = [];
    for (let i = 0; i < cdew.length; i++) {
        if (cdew[i].Number == "0") continue;
        //查询出每个产品的详细信息
        let datas1 = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: cdew[i].MaterialNumber } });
        let cds = cdew[i];
        cds.MaterialSpec = datas1[0].MaterialSpec;
        cds.MaterialTexture = datas1[0].MaterialTexture;
        cds.Company = datas1[0].Company;
        cds.datas1Enclosure = datas1[0].datas1Enclosure;
        getzk(cds);
    }
    let len = 0;
    let timer = setInterval(() => {
        if (len == dts.length) {
            clearInterval(timer);
            tableData = jsNums(this.dts, "MaterialNumber", "Number");//去掉重复的物料编码
            tableData.forEach((element) => {
                element.OrderNumber = OrderNumbers;
            });
            ctx.body = {
                status: true, data: tableData
            };
        } else {
            len = dts.length;
        }
    }, 500);
}
let dataList = null;
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
// async function findsalesOrderByOrderNumber(v) {
//     // let code = [];
//     // DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
//     return await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: v } });
//     // await this.$https({
//     //   method: "get",
//     //   url: "/api/apiModel/find",
//     //   params: {
//     //     table: "salesOrderDetail",
//     //     where: { OrderNumber: v },
//     //   },
//     // })
//     //   .then((res) => {
//     //     console.log(res);
//     //     code = res;
//     //   })
//     //   .catch((err) => {
//     //     console.log(err);
//     //   });
//     // return code;
// }
// async function findnum2(productNumber) {
//     // return await DB.find("__basicMaterialList", { MaterialNumber: productNumber }, JSON.stringify({ _id: -1 }));
//     return await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: productNumber }});

//     // let datas1 = null;
//     // await this.$https({
//     //   method: "get",
//     //   url: "/api/apiModel/find",
//     //   params: {
//     //     table: "__basicMaterialList",
//     //     dataBase: "base",
//     //     where: { MaterialNumber: productNumber },
//     //     sortJson: { _id: -1 },
//     //   },
//     // })
//     //   .then((res) => {
//     //     console.log("res123456===", res);
//     //     datas1 = res;
//     //   })
//     //   .catch((err) => {
//     //     console.log(err);
//     //   });
//     // return datas1;
// }


// async function findnum(productNumber) {
//     // return await DB.find("__basicMaterialList", { MaterialNumber: productNumber }, JSON.stringify({ _id: -1 }), dataBase: "base");
//     return await apiModel.find({ table: "__materialDetails", dataBase: "base", where: { Parent: productNumber }, sortJson: { _id: -1 } });

//     // await this.$https({
//     //     method: "get",
//     //     url: "/api/apiModel/find",
//     //     params: {
//     //         table: "__materialDetails",
//     //         dataBase: "base",
//     //         where: { Parent: productNumber },
//     //         sortJson: { _id: -1 },
//     //     },
//     // })
//     //     .then((res) => {
//     //         this.datas = res;
//     //     })
//     //     .catch((err) => {
//     //         console.log(err);
//     //     });
// }







module.exports = materialPlanTransaction;

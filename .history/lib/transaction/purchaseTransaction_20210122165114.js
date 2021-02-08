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
            await JSCGDNO(data.datas, data.OrderNumber)
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

async function JSCGDNO(datas, OrderNumber) {
    //1.查询当天的po单号
    let dt = new Date();
    let Y = dt.getFullYear() + "";
    let M = dt.getMonth() + 1 + "";
    let D = dt.getDate() + "";
    M = M.padStart(2, "0");
    D = D.padStart(2, "0");
    let ces = parseInt(Y + M + D + "000"); //初始采购单号
    let cdss = { PurchaseNumber: { $regex: Y + M + D + "" } };
    let cgd = [];
    //查询当天最高采购单号
    await this.$https({
        method: "get",
        url: "api/apiModel/find",
        params: {
            table: "IntransitOrder",
            where: cdss,
        },
    })
        .then((res) => {
            console.log(res);
            cgd = res;
        })
        .catch((err) => {
            console.log(err);
        });
    //去掉无效的采购单号
    cgd = cgd.filter((item) => {
        return item.PurchaseNumber != "";
    });
    if (cgd.length > 0) {
        cgd.sort((a, b) => {
            return parseInt(a.PurchaseNumber) - parseInt(b.PurchaseNumber);
        });
        ces = parseInt(cgd[cgd.length - 1].PurchaseNumber); //最高采购单号
    }
    console.log("最大采购单号:", ces);
    return ces + 1 + "";

}


module.exports = salesOrderTransaction;

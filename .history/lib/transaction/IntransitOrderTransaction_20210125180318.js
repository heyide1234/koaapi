const apiModel = require("../apiModel.js");

class IntransitOrderTransaction {
    static async CLADDZJDTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await CLADDZJD(data.form, data.row, data.CheckNumber, data.time);
        } catch (err) {
            console.log("err====", err)
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

async function CLADDZJD(form,
    row,
    CheckNumber,
    time) {
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
    cgd = await apiModel.find({ table: "IntransitOrder", where: cdss });
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
    return ces + 1 + "";

}




module.exports = IntransitOrderTransaction;

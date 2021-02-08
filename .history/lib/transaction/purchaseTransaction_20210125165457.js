const apiModel = require("../apiModel.js");


let id1 = null;
let form1 = null;
let loginName = null;//创建人
let times = null;//当前时间
class salesOrderTransaction {
    static async JSCGDNOTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;

        try {
            returndata = await JSCGDNO();
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

    static async SCCGDTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;

        try {
            returndata = await SCCGD(data.form, data.row, data.Purpose, data.time);
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

async function JSCGDNO() {
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
//生成采购单
async function SCCGD(form, row, Purpose, time) {
    let cd = parseInt(form.SurplusDistribution) - parseInt(form.PlanNumber); //剩余分配数
    let temp = "0";
    if (cd < 0) {
        let pynum = 0;
        res = await apiModel.find({ table: "YYB", where: { MaterialNumber: materialNumber } });
        if (res.length > 0) {
            pynum = parseInt(res[0].Number);
        }
        let yynum = pynum + Math.abs(cd); //修改为当前数量
        apiModel.updateByWhere({ table: "YYB", where: { MaterialNumber: form.MaterialNumber }, form: { Number: yynum + "" } });//盈余表
    }
    if (cd <= 0) {
        temp = "1";
    }
    let fs = {
        PlanNumber: form.PlanNumber,
        SurplusDistribution: cd > 0 ? cd + "" : "0",
        status: temp,
    };
    //修改采购单
    apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
    let tempsd = JSON.parse(JSON.stringify(row));
    tempsd.PurchaseNumber = form.PurchaseNumber; //采购编号
    tempsd.CheckNumber = ""; //质检单号
    tempsd.supplierNumber = form.supplierNumber; //供应商编号
    tempsd.PlannedDeliveryDate = form.PlannedDeliveryDate; //计划交期
    tempsd.supplierName = form.supplierName; //供应商名称
    tempsd.Contacts = form.Contacts; //
    tempsd.ContactsPhone = form.ContactsPhone; //
    tempsd.Purpose = Purpose;
    tempsd.ActualNumber = "";
    tempsd.ActualNumbertotal = "0";
    tempsd.ShouldNumber = form.PlanNumber;
    tempsd.ActualPrice = form.ActualPrice;
    tempsd.SYtotal = form.PlanNumber;
    tempsd.Monry = "";
    tempsd.tMonry = "";
    tempsd.status = "0";
    tempsd.creatdate = time; //创建时间
    delete tempsd.PlanNumber;
    delete tempsd._id;
    //在途插入
    apiModel.insert({
        table: "IntransitOrder",
        form: tempsd,
    });
    //采购单头添加
    let tempsC = {
        OrderNumber: tempsd.OrderNumber, //订单编号
        PurchaseNumber: tempsd.PurchaseNumber, //采购编号
        supplierNumber: tempsd.supplierNumber, //供应商编号
        supplierName: tempsd.supplierName, //供应商名称
        Contacts: tempsd.Contacts, //联系人
        ContactsPhone: tempsd.ContactsPhone, //联系人电话
        TotalAmount: "", //总金额
        creatdate: time, //创建时间
    };
    let res = await apiModel.find({ table: "CGDhead", where: { PurchaseNumber: tempsd.PurchaseNumber } });
    if (res.length == 0) {
        apiModel.insert({
            table: "CGDhead",
            form: tempsC,
        });
    }
    //进入推单模式
    let res = await apiModel.find({ table: "salesOrder", where: { OrderNumber: row.OrderNumber } });
    if (parseInt(res[0].processCode) < 5) {
        apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: row.OrderNumber }, form: { processCode: "5" } })
    }
}
async function insertPurshHead(tempsd, time) {

}


module.exports = salesOrderTransaction;

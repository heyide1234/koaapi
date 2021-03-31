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
            returndata = await SCCGD(data.form, data.row, data.Purpose, data.creater, data.time);
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
    cgd = await apiModel.find({ table: "CGDhead", where: cdss });
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
    ces = ces + 1 + "";

    return ces;

}
//生成采购单
async function SCCGD(form, row, Purpose, creater, time) {
    // let ddbk = Purpose.indexOf("备库") == -1;
    let YYNUMS = '0';
    let cd = parseInt(form.SurplusDistribution) - parseInt(form.PlanNumber); //剩余分配数
    let temp = "0";
    // res[0].TotalAmount
    if (cd < 0) {
        let pynum = 0;
        let pyzje = 0;//该物料总金额
        let res = [];
        YYNUMS = Math.abs(cd) + "";
        // if (ddbk) res = await apiModel.find({ table: "YYB", where: { MaterialNumber: form.MaterialNumber } });
        if (res.length > 0) {
            pynum = parseInt(res[0].Number);
            pyzje = parseFloat(res[0].TotalAmount);
        }
        let yynum = pynum + Math.abs(cd); //修改为当前数量

        // if (ddbk) apiModel.updateByWhere({
        //     table: "YYB",
        //     where: { MaterialNumber: form.MaterialNumber },
        //     form: { Number: yynum + "", TotalAmount: pyzje + Math.abs(cd) * parseFloat(form.ActualPrice) + "" }
        // });//盈余表
        // if (ddbk) apiModel.insert({ table: 'YYBJL', form: { OrderNumber: row.OrderNumber, MaterialNumber: row.MaterialNumber, Number: Math.abs(cd), TotalAmount: Math.abs(cd) * parseFloat(form.ActualPrice) + "" } });

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
    tempsd.GYSHTH = form.GYSHTH;//供应商合同编号
    tempsd.PlannedDeliveryDate = form.PlannedDeliveryDate; //计划交期
    tempsd.supplierName = form.supplierName; //供应商名称
    tempsd.Contacts = form.Contacts; //
    tempsd.ContactsPhone = form.ContactsPhone; //
    tempsd.Purpose = Purpose;
    tempsd.ActualNumber = "";
    tempsd.ActualNumbertotal = "0";
    tempsd.ActualPrice = form.ActualPrice;

    tempsd.SYtotal = form.PlanNumber;
    tempsd.ShouldNumber = tempsd.SYtotal;
    tempsd.YYNUMS = YYNUMS;
    tempsd.Monry = "";
    tempsd.tMonry = "";
    tempsd.status = "0";
    tempsd.creater = creater
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
        Approval: "未审批",//审批状态
        Approver: "",//审批人
    };
    let res1 = await apiModel.find({ table: "CGDhead", where: { PurchaseNumber: tempsd.PurchaseNumber } });
    if (res1.length == 0) {
        apiModel.insert({
            table: "CGDhead",
            form: tempsC,
        });
    }
    //进入推单模式
    let res2 = await apiModel.find({ table: "salesOrder", where: { OrderNumber: row.OrderNumber } });
    if (parseInt(res2[0].processCode) < 5) {
        apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: row.OrderNumber }, form: { processCode: "5" } })
    }
}



module.exports = salesOrderTransaction;

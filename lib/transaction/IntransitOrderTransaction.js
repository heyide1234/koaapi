const apiModel = require("../apiModel.js");

class IntransitOrderTransaction {
    static async CLADDZJDTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await CLADDZJD(data.form, data.row, data.CheckNumber, data.time, data.id);
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

async function CLADDZJD(form, row, checkNumber, time, id) {
    let tempsd = JSON.parse(JSON.stringify(row));
    let CheckNumber = checkNumber;
    //质检单号不存在时创建新的质检单号
    if (CheckNumber == "" || CheckNumber == null) {
        CheckNumber = await getCheckNumber();
    }
    let cfd = parseInt(row.ActualNumbertotal) + parseInt(form.ActualNumber);
    tempsd.CheckNumber = CheckNumber; //质检单号
    tempsd.ActualNumber = form.ActualNumber;
    tempsd.ActualNumbertotal = cfd + "";
    tempsd.status = "0";
    tempsd.TotalCheckNum = "0"; //检验总数
    tempsd.CheckNum = "0"; //质检数量
    tempsd.NGNum = "0"; //不合格数
    tempsd.CheckRemarks = ""; //检验结果
    tempsd.Checker = ""; //质检人
    tempsd.creatdate = time; //创建时间
    delete tempsd._id;
    apiModel.insert({
        table: "IncomingCheck",
        form: tempsd,
    });
    //修改数量

    let stu = "0";
    let SYtotals = 0;
    if (row.ShouldNumber <= cfd) {
        stu = "1";
    }
    if (row.ShouldNumber > cfd) {
        SYtotals = parseInt(row.ShouldNumber) - parseInt(cfd);
    }
    let fs = {
        ActualNumbertotal: cfd + "", //实到总数量
        ActualNumber: form.ActualNumber, //该次到货数量
        CheckNumber: CheckNumber,
        SYtotal: SYtotals + "",
        status: stu,
    };
    let fsf = {
        PurchaseNumber: row.PurchaseNumber,
        MaterialNumber: row.MaterialNumber,
    };
    //修改在途单
    apiModel.update({ table: "IntransitOrder", id: id, form: fs });

    //进入推单模式
    let res = await apiModel.find({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber } });
    if (parseInt(res[0].processCode) < 6) {
        apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });
    }
    ////////////

}
async function getCheckNumber() {
    let dt = new Date();
    let Y = dt.getFullYear() + "";
    let M = dt.getMonth() + 1 + "";
    let D = dt.getDate() + "";
    M = M.padStart(2, "0");
    D = D.padStart(2, "0");
    let yyr = Y + M + D + "";
    let checkNum = "";
    let ces = parseInt(yyr + "000"); //初始采购单
    let cdss = { CheckNumber: { $regex: yyr } };
    let ress = [];
    ress = await apiModel.find({ table: "IncomingCheck", where: cdss });
    ress = ress.filter((item) => {
        return item.CheckNumber != "";
    });
    if (ress.length > 0) {
        ress.sort((a, b) => {
            return parseInt(a.CheckNumber) - parseInt(b.CheckNumber);
        });
        ces = parseInt(ress[ress.length - 1].CheckNumber); //最高采购单号
    }
    checkNum = ces + 1 + "";
    return checkNum;
}

module.exports = IntransitOrderTransaction;

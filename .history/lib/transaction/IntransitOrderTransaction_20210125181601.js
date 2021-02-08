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

async function CLADDZJD(form, row, CheckNumber, time) {
    let tempsd = JSON.parse(JSON.stringify(row));
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
    let cfd = parseInt(row.ActualNumbertotal) + parseInt(form.ActualNumber);
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
    apiModel.updateByWhere({ table: "IntransitOrder", where: fsf, form: fs });

    //进入推单模式
    let res = await apiModel.find({ table: "salesOrder", where: { OrderNumber: "6" } });
    if (parseInt(res[0].processCode) < 6) {
        apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });
    }
    ////////////

}

module.exports = IntransitOrderTransaction;

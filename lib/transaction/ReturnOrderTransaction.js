const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

class ReturnOrderTransaction {
    static async ReturnOrderTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await ReturnOrder(data.form, data.row, data.time);
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

async function ReturnOrder(form, row, time) {
    form.RNumbers = parseInt(row.RNumbers) + parseInt(form.RNumber);
    let vo = "0";
    if (
        parseInt(form.RNumbers) > parseInt(row.TNumber) ||
        parseInt(form.RNumbers) == parseInt(row.TNumber)
    ) {
        vo = "1";
    }
    let fs = {
        RNumbers: form.RNumbers,
        RNumber: form.RNumber,
        status: vo,
    };
    //修改当前记录
    apiModel.update({ table: "ReturnOrder", id: row._id, form: fs });
    //生成质检单
    let tempsd = JSON.parse(JSON.stringify(row));
    tempsd.status = "0";
    tempsd.Checker = ""; //质检人

    tempsd.TotalCheckNum = "0"; //检验总数
    tempsd.CheckNum = "0"; //质检数量
    tempsd.NGNum = "0"; //不合格数
    tempsd.CheckRemarks = ""; //检验结果

    tempsd.ShouldNumber = row.TNumber;
    tempsd.ActualNumbertotal = form.RNumbers;
    tempsd.ActualNumber = form.RNumber;
    tempsd.creatdate = time;

    delete tempsd._id;
    delete tempsd.TNumber;
    delete tempsd.RNumbers;
    delete tempsd.RNumber;
    apiModel.insert({ table: 'IncomingCheck', form: tempsd });
}
module.exports = ReturnOrderTransaction;

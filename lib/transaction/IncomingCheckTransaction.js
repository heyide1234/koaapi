const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

class IncomingCheckTransaction {
    static async IncomingCheckTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await IncomingCheck(data.form, data.row, data.TotalCheckNum, data.Checker, data.time);
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

async function IncomingCheck(form, row, TotalCheckNum, Checker, time) {
    form.NGNum = form.NGNum || "0";
    let stu = "0";
    if (parseInt(row.ActualNumber) === TotalCheckNum) {
        stu = "1";
    }
    if (parseInt(row.ActualNumber) < TotalCheckNum) {
        stu = "1";
    }
    let fs = {
        TotalCheckNum: TotalCheckNum,
        CheckNum: form.CheckNum,
        NGNum: form.NGNum,
        CheckRemarks: form.CheckRemarks,
        status: stu,
        Checker: Checker,
        creatdate: time,
    };
    apiModel.update({ table: "IncomingCheck", id: row._id, form: fs });//修改检验数据
    //增加材料入库单
    let rkdata = JSON.parse(JSON.stringify(row));
    let nusd = parseInt(form.CheckNum) - parseInt(form.NGNum);
    if (nusd > 0) {
        rkdata.TotalCheckNum = TotalCheckNum;
        rkdata.CheckNum = form.CheckNum;
        rkdata.NGNum = form.NGNum;
        rkdata.CheckRemarks = form.CheckRemarks;
        rkdata.OKNumber = nusd + "";
        rkdata.FirmOKNumber = "0";
        rkdata.status = "0";
        rkdata.Checker = Checker;
        rkdata.creatdate = time;
        delete rkdata._id;
        apiModel.insert({ table: 'Warehousing', form: rkdata });//入库
    }
    //增加退货单
    if (form.NGNum > 0) {
        let thdata = JSON.parse(JSON.stringify(row));
        thdata.TNumber = form.NGNum; //退货数量
        thdata.RNumbers = "0"; //还货总计
        thdata.RNumber = "0"; //本次还货数量
        thdata.status = "0";
        thdata.Checker = Checker; //质检人
        thdata.creatdate = time;
        thdata.CheckerRemarks = form.CheckRemarks; //质检结果
        delete thdata._id;
        apiModel.insert({ table: 'ReturnOrder', form: thdata });////添加退货单
    }
    //进入推单模式
    let res = await apiModel.find({ table: "salesOrder", where: { OrderNumber: row.OrderNumber } });
    if (parseInt(res[0].processCode) < 7) {
        apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: row.OrderNumber }, form: { processCode: "7" } });
    }
}

module.exports = IncomingCheckTransaction;

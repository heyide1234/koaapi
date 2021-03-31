const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

class ApprovalTransaction {
    static async ApprovalTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await Approval(data.row, data.ApprovalClass, data.Approver);
        } catch (err) {
            status = false;
            returndata = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status, data: returndata
        };
    }

}
async function Approval(row, ApprovalClass, Approver) {
    console.log("start!!!!!!!")

    if (ApprovalClass == "订单审批") {
        apiModel.update({
            table: "salesOrder", id: row._id, form: {
                Approval: "已审批",
                Approver: Approver,
            }
        });

    }
    if (ApprovalClass == "采购审批") {
        let res = await apiModel.find({ table: "IntransitOrder", where: { PurchaseNumber: row.PurchaseNumber } });
        for (let k = 0; k < res.length; k++) {
            resyy = await apiModel.find({ table: "YYB", where: { MaterialNumber: res[k].MaterialNumber } });
            let yynum = parseInt(resyy[0].Number) + parseInt(res[k].YYNUMS);
            let pyzje = parseFloat(resyy[0].TotalAmount) + parseInt(res[k].YYNUMS) * parseFloat(res[k].ActualPrice);
            await apiModel.updateByWhere({
                table: "YYB",
                where: { MaterialNumber: res[k].MaterialNumber },
                form: { Number: yynum + "", TotalAmount: pyzje + "" }
            });//盈余表
            await apiModel.insert({ table: 'YYBJL', form: { OrderNumber: row.OrderNumber, MaterialNumber: res[k].MaterialNumber, Number: res[k].YYNUMS, TotalAmount: parseInt(res[k].YYNUMS) * parseFloat(res[k].ActualPrice) + "" } });

        }
        apiModel.update({
            table: "CGDhead", id: row._id, form: {
                Approval: "已审批",
                Approver: Approver,
            }
        });
    }


}


module.exports = ApprovalTransaction;

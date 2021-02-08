const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

class yybTransaction {
    static async yybTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await yyb(data.form, data.currentNum, data.operation, data.ids);
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
async function yyb(form, currentNum, operation, ids) {
    let nums = parseInt(form.Number) - parseInt(currentNum); //记录当前的差额数，用于实际库存增减
    ///库存管理增减
    let flag = await findstorck(form.MaterialNumber, nums);
    if (flag) {
        if (operation === "add") {
            this.add();
            apiModel.insert({ table: 'YYB', form: form });
        } else {
            this.update();
            apiModel.update({ table: "YYB", id: ids, form: form });

        }
    }

}
async function findstorck(MaterialNumber, num) {
    let temps = await apiModel.find({ table: "stock", where: { MaterialNumber: MaterialNumber } });
    if (temps.length == 0) {
        return false;
    } else {
        let nu = parseInt(num) + parseInt(temps[0].Number);
        let synu = parseInt(num) + parseInt(temps[0].SYNumber);
        if (nu < 0 || synu < 0) {
            return false;
        } else {
            console.log(num);
            apiModel.update({ table: "stock", id: temps[0]._id, form: { Number: nu, SYNumber: synu } });
            return true;
        }
    }
}
module.exports = yybTransaction;

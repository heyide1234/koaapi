const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

class yybTransaction {
    static async yybTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = false;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await yyb(data.form, data.currentNum, data.operation, data.ids, data.synums);
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
    static async YYBREFTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = false;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await YYBREF();
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
async function yyb(form, currentNum, operation, ids, synums) {
    let nums = parseInt(form.Number) - parseInt(currentNum); //记录当前的差额数，用于实际库存增减
    ///库存管理增减
    let flag = await findstorck(form.MaterialNumber, nums, synums);

    if (flag) {
        if (operation === "add") {
            apiModel.insert({ table: 'YYB', form: form });
            return true
        } else {
            apiModel.update({ table: "YYB", id: ids, form: form });
            return true
        }
    }

}
async function findstorck(MaterialNumber, num, synums) {
    let temps = await apiModel.find({ table: "stock", where: { MaterialNumber: MaterialNumber } });
    if (temps.length == 0) {
        return false;
    } else {
        let nu = parseInt(num) + parseInt(temps[0].Number);
        let synu = parseInt(num) + parseInt(temps[0].SYNumber);
        synums = synums || 0;
        synu = synu + parseInt(synums);
        if (nu < 0 || synu < 0) {
            return false;
        } else {
            apiModel.update({ table: "stock", id: temps[0]._id, form: { Number: nu, SYNumber: synu } });
            return true;
        }
    }
}
async function YYBREF() {
    await apiModel.deleteByWhere({ table: "YYB", where: {} });
    let res = await apiModel.find({ table: "stock", where: {} });
    for (let i = 0; i < res.length; i++) {
        apiModel.insert({
            table: 'YYB', form: {
                MaterialNumber: res[i].MaterialNumber,
                MaterialName: res[i].MaterialName,
                MaterialSpec: res[i].MaterialSpec,
                Number: res[i].Number,
                TotalAmount: "0",
                safetyStock: "0"
            }
        });
    }
}
module.exports = yybTransaction;

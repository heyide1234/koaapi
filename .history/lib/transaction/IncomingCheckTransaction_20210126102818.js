const apiModel = require("../apiModel.js");

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

async function IncomingCheck(form, row, checkNumber, time) {



}


module.exports = IncomingCheckTransaction;

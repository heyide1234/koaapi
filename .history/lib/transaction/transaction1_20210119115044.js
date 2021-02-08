const DB = require("../mongodb");
class testTransaction {
    static async userTransaction(ctx) {
        let param = null;
        let returnData = null;
        param = ctx.request.body;//post
        param = ctx.request.query;//get

        try {
            console.log("param==", param);
            returnData = await DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
            console.log("returnData1==", returnData);
        } catch (err) {
            returnData = `[MongoDB] ERROR: ${err}`
        } finally {
            console.log('completed!');
        }
        console.log("returnData2==", returnData);
        ctx.body = returnData;
    }
}
module.exports = testTransaction;

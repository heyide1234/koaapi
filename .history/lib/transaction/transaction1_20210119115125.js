const DB = require("../mongodb");
class testTransaction {
    static async userTransaction(ctx) {
        let data = null;
        let returnData = null;
        data = ctx.request.body;//post
        data = ctx.request.query;//get

        try {
            console.log("param==", data);
            returnData = await DB.find(data.table, data.where, typeof (data.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : data.sortJson);
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

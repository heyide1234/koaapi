const DB = require("../mongodb");
class testTransaction {
    static async userTransaction(ctx) {
        let data = null;
        let returnData = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returnData = await DB.find(data.table, data.where, typeof (data.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : data.sortJson);

        } catch (err) {
            returnData = `[MongoDB] ERROR: ${err}`
        } finally {
            console.log('completed!');
        }

        ctx.body = returnData;
    }
}
module.exports = testTransaction;

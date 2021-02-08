const DB = require("../mongodb");
class testTransaction {
    static async userTransaction(ctx) {
        let data = null;
        let returnData = null;
        console.log("meyhosd===", ctx.request.method.toLowerCase())
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;//post
        data =;//get

        try {
            console.log("param==", data);
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

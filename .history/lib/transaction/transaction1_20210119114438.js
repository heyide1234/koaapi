const DB = require("../mongodb");
class testTransaction {
    static async userTransaction(param) {
        let returnData = null;
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

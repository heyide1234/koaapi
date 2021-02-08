const DB = require("../mongodb");
class testTransaction {
    async Transaction(param) {
        let returnData = null;
        try {
            return DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
        } catch (err) {
            console.log(`[MongoDB transaction] ERROR: ${err}`);
        } finally {

            console.log('事务状态4：', session.transaction.state);
        }
        return returnData
    }
}
module.exports = new testTransaction();

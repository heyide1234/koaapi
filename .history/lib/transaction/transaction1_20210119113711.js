const DB = require("../mongodb");
class testTransaction {
    async Transaction(param) {
        let returnData = null;
        try {
            returnData = await DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
        } catch (err) {
            returnData = `[MongoDB] ERROR: ${err}`
        } finally {
            console.log('completed!');
        }
        console.log("returnData==", returnData);
        return returnData;
    }
}
module.exports = new testTransaction();

const DB = require("../mongodb");

// DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
// DB.queryNum(param.table, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
// DB.queryByPageNum(param.table, param.PageNum, param.sortJson, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
// DB.insert(data.table, data.form);
// DB.deleteOne(data.table, { _id: DB.getObjectID(data.id) });
// DB.delete(data.table, data.where);
// DB.update(data.table, { _id: DB.getObjectID(data.id) }, data.form);
// DB.update(data.table, data.where, data.form);

let id1 = null;
let form1 = null;
let returndata = null;
let loginName = null;//创建人
let times = null;//当前时间
class materialPlanTransaction {
    //物料展开
    static async materialPlanTransactionZKTransaction(ctx) {
        let data = null;//请求的数据
        let returnData = null;//返回的数据
        let status = true;//记录当前返回值状态
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        loginName = data.loginName;
        times = data.times;
        try {
            await tdprocess(data.datas, data.OrderNumber)
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

async function zkmif(OrderNumbers) {
    const loading = this.$loading({
        lock: true,
        text: "BOM计算中...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
    });
    let cdew = await this.findsalesOrderByOrderNumber(OrderNumbers); //销售订单明细

    this.tableData1 = [];
    this.dts = [];
    for (let i = 0; i < cdew.length; i++) {
        if (cdew[i].Number == "0") continue;
        let datas1 = await this.findnum2(cdew[i].MaterialNumber);
        // console.log("datas1====", this.datas1);
        let cds = cdew[i];
        cds.MaterialSpec = datas1[0].MaterialSpec;
        cds.MaterialTexture = datas1[0].MaterialTexture;
        cds.Company = datas1[0].Company;
        cds.datas1Enclosure = datas1[0].datas1Enclosure;
        this.getzk(cds);
    }
    let len = 0;
    let timer = setInterval(() => {
        if (len == this.dts.length) {
            clearInterval(timer);
            this.tableData1 = jsNums(this.dts, "MaterialNumber", "Number");
            this.tableData1.forEach((element) => {
                element.OrderNumber = OrderNumbers;
            });
            loading.close();
        } else {
            len = this.dts.length;
        }
    }, 500);
}








module.exports = materialPlanTransaction;

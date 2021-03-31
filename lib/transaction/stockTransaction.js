// const DB = require("../mongodb");
const apiModel = require("../apiModel.js");




// DB.find(param.table, param.where, typeof (param.sortJson) === "undefined" ? JSON.stringify({ _id: -1 }) : param.sortJson);
// DB.queryNum(param.table, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
// DB.queryByPageNum(param.table, param.PageNum, param.sortJson, typeof (param.pageWhere) === "undefined" ? JSON.stringify({}) : param.pageWhere);
// DB.insert(data.table, data.form);
// DB.deleteOne(data.table, { _id: DB.getObjectID(data.id) });
// DB.delete(data.table, data.where);
// DB.update(data.table, { _id: DB.getObjectID(data.id) }, data.form);
// DB.update(data.table, data.where, data.form);

// let id1 = null;
// let form1 = null;
// let loginName = null;//创建人
// let times = null;//当前时间

let data = null;//请求的数据
let returnData = null;//返回的数据
let status = false;//记录当前返回值状态
let tableDataModel = [];
let dataList = [];//循环存储递归的物料明细
let OrderNumber = "";//订单号
class stockTransaction {
    //物料展开
    static async RefreshKCTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            await RefreshKC();
            status = true;
        } catch (err) {
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;
        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status
        };
    }

}
////////////执行计划单//////////////
async function RefreshKC() {
    let dt = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: {} });
    for (let i = 0; i < dt.length; i++) {
        let dts = await apiModel.find({ table: "stock", where: { MaterialNumber: dt[i].MaterialNumber } });
        if (dts.length == 0) {
            await apiModel.insert({
                table: 'stock', form: {
                    MaterialNumber: dt[i].MaterialNumber,//物料编号
                    MaterialName: dt[i].MaterialName,//物料名称
                    MaterialSpec: dt[i].MaterialSpec,//规格型号
                    Thumbnail: dt[i].Thumbnail,//缩略图
                    Number: "0",//数量
                    SYNumber: "0",//剩余数
                    Location: "",//库位
                    MaterialSource: "",//材料来源
                    Purpose: "",//用途
                    Company: dt[i].Company,
                    Status: "",//状态
                    creater: "", //创建人
                    creatdate: "" //创建时间
                }
            });

        } else {
            await apiModel.updateByWhere({
                table: "stock", where: { MaterialNumber: dt[i].MaterialNumber }, form: {
                    MaterialName: dt[i].MaterialName,//物料名称
                    MaterialSpec: dt[i].MaterialSpec,//规格型号
                    Thumbnail: dt[i].Thumbnail,//缩略图
                    Company: dt[i].Company
                }
            });
        }
    }

}

module.exports = stockTransaction;

// const DB = require("../mongodb");
const apiModel = require("../apiModel.js");


let data = null;//请求的数据
let returnData = null;//返回的数据
let status = false;//记录当前返回值状态
let tableData = [];//返回的数据
let dataList = [];//循环存储递归的物料明细
let OrderNumber = "";//订单号
let count = 0;
class MaterialZKByProduct {
    //物料展开
    static async MaterialZK(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            await zkMeterial(data.row)
            status = true;
        } catch (err) {
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;
        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status, data: count
        };
    }
    //树图展开
    static async diagram(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            dataList = "";
            await zkdiagram(data.MaterialNumber)
            status = true;
        } catch (err) {
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;
        } finally {
            console.log('completed!');
        }
        ////
        let len = 0;
        while (true) {
            await sleep(500);
            if (dataList.length != len) {
                len = dataList.length;
            } else {
                break;
            }
        }
        dataList = `[` + dataList + `]`;
        ctx.body = {
            status: status, data: JSON.parse(dataList.replace(/\[,{/g, "[{"))
        };
    }
    //物料信息更新
    static async materialDetailsReflesh(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            await Reflesh(data.table)
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
////////////计算物料展开//////////////
async function zkMeterial(product) {
    product.Number = "1";
    dataList = [];
    getzk(product);
    let len = 0;
    while (true) {
        await sleep(500);
        if (dataList.length != len) {
            len = dataList.length;
        } else {
            break;
        }
    }
    dataList = jsNums(dataList, "MaterialNumber", "Number");
    let models = {};//物料清单数量
    let modelsCK = {};//仓库物料数量
    for (let j = 0; j < dataList.length; j++) {
        models[dataList[j].MaterialNumber] = dataList[j].Number;//存取物料清单数
        let dat = await apiModel.find({ table: "stock", where: { MaterialNumber: dataList[j].MaterialNumber } });
        if (dat.length > 0) {
            modelsCK[dataList[j].MaterialNumber] = dat[0].SYNumber
        } else {
            modelsCK[dataList[j].MaterialNumber] = "0"
        }
    }
    count = 0;
    let flag = true;
    while (flag) {
        count++;
        for (let key in models) {
            if (parseInt(models[key]) * count > parseInt(modelsCK[key])) {
                count--;
                flag = false;
                break;
            }
        }
    }
}
//展开BOM
async function getzk(product, n1 = "1") {
    let n = parseInt(product.Number) * parseInt(n1) + ""; //当前数
    let products = await apiModel.find({ table: "__materialDetails", dataBase: "base", where: { Parent: product.MaterialNumber } });
    if (products.length > 0) {
        for (let i = 0; i < products.length; i++) {
            await getzk(products[i], n);
        }
    } else {
        product.Number = n;
        product.OrderNumber = OrderNumber;
        dataList.push(product);
        return;
    }
}
async function zkdiagram(MaterialNumber, n1 = 1) {
    dataList +=
        `,{"name": ` + MaterialNumber + `,"value": ` + n1 + `,"children":[`;
    //当前产品对应的物料list
    let mums = await apiModel.find(
        {
            table: "__materialDetails",
            dataBase: "base",
            where: { Parent: MaterialNumber }
        }
    )
    if (mums.length > 0) {
        for (let i = 0; i < mums.length; i++) {
            await zkdiagram(mums[i].MaterialNumber, mums[i].Number * n1);
        }
    }
    dataList += `]}`;
}
//物料刷新
async function Reflesh(table) {
    let dt = await apiModel.find({ table: table, dataBase: "base", where: {} });
    for (let i = 0; i < dt.length; i++) {
        let dts = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: dt[i].MaterialNumber } });
        if (dts.length > 0) {
            await apiModel.updateByWhere({
                table: table, dataBase: "base", where: { MaterialNumber: dt[i].MaterialNumber }, form: {
                    MaterialName: dts[0].MaterialName,//物料名称
                    MaterialSpec: dts[0].MaterialSpec,//规格型号
                    Thumbnail: dts[0].Thumbnail,//缩略图
                    Company: dts[0].Company
                }
            });
        }
    }
}
////////////////
/////工具函数//////
///////////////
function sleep(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
function jsNums(arr, ids, attr) {
    //自带去重
    if (arr.length == 1) return arr;
    // debugger;
    arr.sort((a, b) => {
        return parseFloat(a[ids]) - parseFloat(b[ids]);
    });
    let newArr = [];
    let obj = null;
    for (let i = 0; i < arr.length; i++) {
        if (obj == null) {
            obj = arr[i];
        } else {
            if (obj[ids] == arr[i][ids]) {
                obj[attr] = parseFloat(obj[attr]) + parseFloat(arr[i][attr]) + "";
                if (arr.length - 1 == i) newArr.push(obj);
            } else {
                newArr.push(obj);
                obj = arr[i];
                if (arr.length - 1 == i) newArr.push(obj);
            }
        }
    }
    return newArr;
}
module.exports = MaterialZKByProduct;

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
let tableData = [];//返回的数据
let tableDataModel = [];
let dataList = [];//循环存储递归的物料明细
let OrderNumber = "";//订单号
class Manufacturing {
    //物料展开
    static async ManufacturingPlanTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            OrderNumber = data.OrderNumber;
            await ManufacturingPlan(data.row, data.saveNum, data.LLNumber, data.creater, data.creatdate)

            status = true;
        } catch (err) {
            console.log("err...", err);
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }


        ctx.body = {
            status: status
        };
    }
    //将展开的物料存储到计划物料需求单中
    static async materialPlanADDTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            // console.log("start...");
            await addMeterial(data.datas, data.OrderNumber)

            status = true;
        } catch (err) {
            console.log("err...", err);
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }

        console.log("end...");
        ctx.body = {
            status: status, data: returnData
        };
    }

    //根据计划物料和盘盈仓库数计算出实际需求数
    static async materialPlanYYBTransaction(ctx) {
        //     data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        //     // loginName = data.loginName;
        //     // times = data.times;
        //     try {
        //         // console.log("start...");
        //         await JSMeterial(data.datas, data.OrderNumber)
        //         status = true;
        //     } catch (err) {
        //         console.log("err...", err);
        //         status = false;
        //         returnData = `[MongoDB] ERROR: ${err}`;

        //     } finally {
        //         console.log('completed!');
        //     }

        //     console.log("end...");
        //     ctx.body = {
        //         status: status, data: returnData
        //     };
    }
}
////////////执行计划单//////////////
let productsh = null;
async function ManufacturingPlan(row, saveNum, LLNumber, creater, creatdate) {
    //生成单个产品物料明细模板
    await productionModel(row);//tableDataModel
    let t = await getSn(); //产品SN typeOf int
    let df = {//产品sn模板
        SN: "", //SN
        OrderNumber: row.OrderNumber, //订单编号
        MaterialNumber: row.MaterialNumber, //产品编号
        MaterialName: row.MaterialName, //产品名称
        Thumbnail: row.Thumbnail, //
        MaterialSpec: row.MaterialSpec, //
        Number: "1", //产品数量
        status: "0", //状态
        creater: creater, //创建人
        creatdate: creatdate, //创建时间
    };
    for (let i = 0; i < parseInt(LLNumber); i++) {
        df.SN = t + i + "";
        df.IsDeliverGoods = "0";
        apiModel.insert({ table: 'ManufacturingExecution', form: df });
        insertByManufactringExecutionDetail(
            df.SN,
            row.OrderNumber
        );
    }
    //修改执行计划单的状态
    if (saveNum > 0) {
        apiModel.update({ table: "ManufacturingPlan", id: row._id, form: { SurplusNumber: saveNum + "", status: "0" } });
    } else if (saveNum == 0) {
        apiModel.update({ table: "ManufacturingPlan", id: row._id, form: { SurplusNumber: "0", status: "1" } });
    }
}
async function insertByManufactringExecutionDetail(SN, OrderNumber) {
    let d = JSON.parse(JSON.stringify(tableDataModel));
    for (let i = 0; i < d.length; i++) {
        this.$delete(d[i], "_id");
        d[i].SupplierCode = "";
        d[i].ConfirmNumber = "";
        d[i].Picker = sessionStorage.getItem("loginName") || "未登陆";
        d[i].OP = "";
        d[i].Operator = "";
        d[i].Checker = "";
        d[i].Remark = "";
        d[i].status = "0";
        /////////////////////////
        d[i].SN = SN;
        d[i].OrderNumber = OrderNumber;
        //插入执行明细
        await this.$https({
            method: "post",
            url: "/api/apiModel/insert",
            data: {
                table: "ManufacturingExecutionDetail",
                form: d[i],
            },
        })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    }
}
//单个产品模板
async function productionModel(row) {
    let datas1 = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: row.MaterialNumber } });
    let cds = JSON.parse(JSON.stringify(row));
    cds.MaterialSpec = datas1[0].MaterialSpec;
    cds.MaterialTexture = datas1[0].MaterialTexture;
    cds.Company = datas1[0].Company;
    cds.datas1Enclosure = datas1[0].datas1Enclosure;
    cds.Number = "1";//单个产品
    dataList = [];//存储物料明细
    getzk(cds);
    await sleep(10000);     // 代码暂停
    tableDataModel = jsNums(dataList, "MaterialNumber", "Number");//去重相加生成单个产品模板
}
async function getSn() {
    let dt = new Date();
    let Y = dt.getFullYear() + "";
    let M = dt.getMonth() + 1 + "";
    let D = dt.getDate() + "";
    if (M.length < 2) M = "0" + M;
    if (D.length < 2) D = "0" + D;
    let nyr = Y + M + D;
    let ces = parseInt(nyr + "000"); //初始SN
    let cdss = { SN: { $regex: nyr + "" } };
    //查询当天存在相同料号SN
    let cgd = await apiModel.find({ table: "ManufacturingExecution", cdss });
    if (cgd.length > 0) {
        cgd.sort((a, b) => {
            return parseInt(a.SN) - parseInt(b.SN);
        });
        ces = parseInt(cgd[cgd.length - 1].SN); //最高SN
    }
    let SN = ces + 1;
    return SN;
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
////////////添加到计划物料数表//////////////
async function addMeterial(datas, orderNumber) {

    for (let i = 0; i < datas.length; i++) {
        delete datas[i]._id;
        datas[i].status = "0";
        await apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
    }
    ///进入推单模式
    apiModel.updateByWhere({ table: 'salesOrder', where: { OrderNumber: orderNumber }, form: { processCode: "3" } });
}
////////////计算出实际物料需求数//////////////
// async function JSMeterial(datast, orderNumber) {
//     let flag = false;
//     for (let i = 0; i < datast.length; i++) {
//         let newrow = datast[i];
//         //盘盈数>=需求数，（盘盈数：相减数为修改后的盘盈数；采购数为为0）
//         //盘盈数<需求数，（盘盈数为0；采购数：相减数绝对值为采购数）
//         let pynum = 0;
//         let resc = await apiModel.find({ table: "YYB", where: { MaterialNumber: newrow.MaterialNumber } }); //该物料盘盈数
//         if (resc.length > 0) pynum = parseInt(resc[0].Number);
//         let num = pynum - parseInt(newrow.Number); //盘盈数-需求数
//         if (num >= 0) {
//             //盘盈数>=需求数//1.修改盘盈数=num
//             apiModel.updateByWhere({ table: 'YYB', where: { MaterialNumber: newrow.MaterialNumber }, form: { Number: num + "" } });
//             //2.修改采购值
//             newrow.Number = "0"; //
//         } else {
//             //盘盈数<需求数//1.修改盘盈数=0
//             apiModel.updateByWhere({ table: 'YYB', where: { MaterialNumber: newrow.MaterialNumber }, form: { Number: "0" } });
//             //2.修改采购值
//             newrow.Number = Math.abs(num) + ""; //
//         }

//         if (newrow.Number != "0") {
//             console.log(1234567)
//             flag = true;
//             newrow.PlanNumber = newrow.Number; //计划采购数量
//             newrow.ShouldNumber = ""; //采购应到数量
//             newrow.ActualNumbertotal = ""; //实际采购总数
//             newrow.ActualNumber = ""; //实际采购数量
//             newrow.ActualPrice = ""; //采购单价
//             newrow.SurplusDistribution = newrow.Number;
//             newrow.supplierNumber = "";
//             newrow.supplierName = "";
//             newrow.status = "0";
//             delete newrow._id;
//             delete newrow.Parent;
//             apiModel.insert({ table: "PurchaseOrder", form: newrow });
//         }
//     }

//     //进入推单模式
//     console.log("flag", flag)
//     if (flag) {
//         apiModel.updateByWhere({ table: 'salesOrder', where: { OrderNumber: orderNumber }, form: { processCode: "4" } });
//     } else {
//         apiModel.updateByWhere({ table: 'salesOrder', where: { OrderNumber: orderNumber }, form: { processCode: "-1" } });
//     }
// }
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
module.exports = Manufacturing;

// const DB = require("../mongodb");
const { find } = require("../apiModel.js");
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
let pdts = [];//子产品
class Manufacturing {
    //物料展开
    static async ManufacturingPlanTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            // OrderNumber = data.OrderNumber;
            await ManufacturingPlan(data.row, data.Purpose, data.saveNum, data.LLNumber, data.OrderNumber, data.creater, data.creatdate);
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
    static async ManufacturingExecutionTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            OrderNumber = data.OrderNumber;
            await ManufacturingExecution(data.datas, data.row, data.forms, data.creater, data.creatdate);
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
    static async ManufacturingPlanBLTransaction(ctx) {
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            OrderNumber = data.OrderNumber;
            await ManufacturingPlanBL(data.row, data.ReplenishmentNumber, data.creater, data.creatdate);
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
async function ManufacturingPlan(row, Purpose, saveNum, LLNumber, OrderNumber, creater, creatdate) {

    let orders = await apiModel.find({ table: "salesOrder", where: { OrderNumber: OrderNumber } })
    if (orders.length > 0 && orders[0].allowHG == "true") {//当该订单允许回滚时
        await apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: OrderNumber }, form: { allowHG: "false" } });
    }
    //生成单个产品物料明细模板
    await productionModel(row);//tableDataModel

    let t = await getSn(); //产品SN typeOf int

    for (let i = 0; i < parseInt(LLNumber); i++) {

        let df = {//产品sn模板
            SN: "", //SN
            OrderNumber: row.OrderNumber, //订单编号
            MaterialNumber: row.MaterialNumber, //产品编号
            MaterialName: row.MaterialName, //产品名称
            Thumbnail: row.Thumbnail, //
            MaterialSpec: row.MaterialSpec, //
            IsDeliverGoods: "制造领料",
            Number: "1", //产品数量
            Purpose: Purpose,
            status: "-1", //状态
            BOM: `[{"label": ` + row.MaterialNumber + `,"children":` + ffs + `}]`,
            creater: creater, //创建人
            creatdate: creatdate, //创建时间
        };

        df.SN = t + i + "";
        df.IsDeliverGoods = "制造领料";
        await apiModel.insert({ table: 'ManufacturingExecution', form: df });
        // productStatus:"在制",
        //主产品下子产品集合
        for (let os = 0; os < pdts.length; os++) {

            let Subsequence = String(os + 1).padStart(3, "0");

            let subs = {
                SN: df.SN,
                OrderNumber: row.OrderNumber,
                Subsequence: Subsequence,
                MaterialNumber: pdts[os].MaterialNumber,
                MaterialName: pdts[os].MaterialName,
                status: "0",
                creater: creater,
                creatdate: creatdate
            }

            await apiModel.insert({ table: 'SubManufacturingExecution', form: subs });


            await insertByManufactringExecutionDetail(
                df.SN,
                row.OrderNumber,
                Subsequence,
                pdts[os].MaterialNumber,
                creater,
                creatdate
            );

        }

        ////////////
        let df1 = {
            SN: df.SN,
            OrderNumber: row.OrderNumber, //订单编号
            Purpose: "生产制造",
            MaterialNumber: row.MaterialNumber, //产品编号
            MaterialName: row.MaterialName, //产品名称
            Number: "1", //产品数量
            Proportioner: "", //配料人
            CLCKNumber: "", //材料出库单号
            Purpose: Purpose,
            status: "0", //状态
            creater: creater, //创建人
            creatdate: creatdate, //创建时间
        };
        //插入材料出库单
        apiModel.insert({ table: 'materialDelivery', form: df1 });

    }

    //修改执行计划单的状态
    if (saveNum > 0) {
        apiModel.update({ table: "ManufacturingPlan", id: row._id, form: { SurplusNumber: saveNum + "", status: "0" } });
    } else if (saveNum == 0) {
        apiModel.update({ table: "ManufacturingPlan", id: row._id, form: { SurplusNumber: "0", status: "1" } });
    }
    ///////



    //修改库存数状态
    if (Purpose && Purpose.indexOf("成品备库") === -1) {
        let dat = await apiModel.find({ table: "stock", where: { MaterialNumber: row.MaterialNumber, } });
        if (dat.length > 0) {
            let cc = parseInt(dat[0].SYNumber) - parseInt(LLNumber) + "";
            apiModel.updateByWhere({ table: 'stock', where: { MaterialNumber: row.MaterialNumber }, form: { SYNumber: cc } });
        }
    }


}
//单个产品模板
let ffs = "";
let dataList2 = [];
async function productionModel(row) {
    let datas1 = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: row.MaterialNumber } });
    let cds = JSON.parse(JSON.stringify(row));
    cds.MaterialSpec = datas1[0].MaterialSpec;
    cds.MaterialTexture = datas1[0].MaterialTexture;
    cds.Company = datas1[0].Company;
    cds.datas1Enclosure = datas1[0].datas1Enclosure;
    cds.Number = "1";//单个产品
    dataList = [];//存储物料明细
    dtss = "[";
    getzk(cds);
    // await sleep(10000);     // 代码暂停
    let flag = true;
    let len = 0
    while (flag) {
        if (dataList.length != len) {
            len = dataList.length;
        } else {
            flag = false;
        }
        await sleep(500);
    }

    dataList2 = JSON.parse(JSON.stringify(dataList));
    pdts = await products(dataList);
    ffs = dtss.replace(/\[,{/g, "[{");
    tableDataModel = jsNums(dataList, "MaterialNumber", "Number");//去重相加生成单个产品模板

}
async function products(dts) {
    let products = [];
    for (let i = 0; i < dts.length; i++) {
        if (products.indexOf(dts[i].Parent) == -1) {
            if (dts[i].Parent != undefined)
                products.push(dts[i].Parent);
        }
    }

    if (products.length == 0) {
        products.push(dts[0].MaterialNumber)
    }
    let dd = [];
    for (let m = 0; m < products.length; m++) {

        let datas1 = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: products[m] } });

        if (datas1.length > 0)
            dd.push(datas1[0])
    }
    if (dd.length == 0) await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: dts[0].MaterialNumber } });
    return dd;
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
    let cgd = await apiModel.find({ table: "ManufacturingExecution", where: cdss });

    if (cgd.length > 0) {
        cgd.sort((a, b) => {
            return parseInt(a.SN) - parseInt(b.SN);
        });
        ces = parseInt(cgd[cgd.length - 1].SN); //最高SN
    }
    let SN = ces + 1;
    return SN;
}
let dtss = "";
//展开BOM
async function getzk(product, Parent = "无", n1 = "1") {
    let n = parseInt(product.Number) * parseInt(n1) + ""; //当前数
    let products = await apiModel.find({ table: "__materialDetails", dataBase: "base", where: { Parent: product.MaterialNumber } });
    if (products.length > 0) {
        for (let i = 0; i < products.length; i++) {
            dtss += `,{"label": ` + products[i].MaterialNumber + `,"children":[`;
            await getzk(products[i], product.MaterialNumber, n);
            dtss += `}`;
        }
    } else {
        product.Number = n;
        product.OrderNumber = OrderNumber;
        product.Parent = Parent;
        dataList.push(product);

    }
    dtss += `]`;
}
//添加sn产品明细
async function insertByManufactringExecutionDetail(SN, OrderNumber, Subsequence, SubseqMaterialNumber, creater, creatdate) {

    let d = [];
    // d= await apiModel.find({ table: "__materialDetails", dataBase: "base", where: { Parent: SubseqMaterialNumber } });
    for (let k = 0; k < dataList2.length; k++) {
        if (dataList2[k].Parent == SubseqMaterialNumber) {
            let t = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: dataList2[k].MaterialNumber } });
            t[0].Number = dataList2[k].Number;
            d.push(t[0]);
        }

    }
    if (d.length == 0) {
        d = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: SubseqMaterialNumber } });
        d[0].Number = "1";
    }
    /////////////////
    for (let i = 0; i < d.length; i++) {
        delete d[i]._id;
        d[i].Subsequence = Subsequence;
        d[i].SubseqMaterialNumber = SubseqMaterialNumber;
        d[i].SupplierCode = "";
        d[i].ConfirmNumber = "";
        d[i].Picker = creater;
        d[i].creatdate = creatdate;
        d[i].OP = "";
        d[i].Operator = "";
        d[i].Checker = "";
        d[i].Remark = "";
        d[i].status = "0";
        d[i].SN = SN;
        d[i].OrderNumber = OrderNumber;
        await apiModel.insert({ table: 'ManufacturingExecutionDetail', form: d[i] });
    }
}

async function ManufacturingExecution(datas, row, forms, creater, creatdate) {
    apiModel.update({ table: "ManufacturingExecutionDetail", id: row._id, form: forms });
    let flg = true;
    for (let i = 0; i < datas.length; i++) {
        if (datas[i].ConfirmNumber == "" || datas[i].ConfirmNumber == undefined) {
            flg = false;
        }
    }
    if (flg) {
        await apiModel.updateByWhere({
            table: 'SubManufacturingExecution', where:
            {
                SN: datas[0].SN,
                MaterialNumber: datas[0].SubseqMaterialNumber
            }, form: { status: "1", creater: creater, creatdate: creatdate }
        });
    }
    let ds = await apiModel.find({ table: "SubManufacturingExecution", where: { SN: datas[0].SN } });
    let vfd = true;
    for (let k = 0; k < ds.length; k++) {
        if (ds[k].status == "0") {
            vfd = false;
        }
    }
    if (vfd) {
        apiModel.updateByWhere({ table: 'ManufacturingExecution', where: { SN: datas[0].SN }, form: { status: "1", IsDeliverGoods: "制造品检", creater: creater, creatdate: creatdate } });
    }
}
async function ManufacturingPlanBL(row, ReplenishmentNumber, creater, creatdate) {
    //1.添加订单头
    let dt = new Date();
    let Y = dt.getFullYear() + "";
    let M = dt.getMonth() + 1 + "";
    let D = dt.getDate() + "";
    if (M.length < 2) M = "0" + M;
    if (D.length < 2) D = "0" + D;
    let Onumber = "8" + Y + M + D + "000";

    let ds = await apiModel.find({ table: "salesOrder", where: { OrderNumber: { $regex: "8" + Y + M + D } } });

    if (ds.length == 1) {
        Onumber = ds[0].OrderNumber;
    }
    if (ds.length > 1) {
        for (let i = 0; i < ds.length; i++) {
            if (parseInt(ds[i].OrderNumber) > parseInt(Onumber))
                Onumber = ds[i].OrderNumber;
        }
    }
    let OrderNumbers = parseInt(Onumber) + 1 + "";
    let fors = {
        OrderNumber: OrderNumbers, //计算出本次订单编号
        processCode: "1", //流程码
        Purpose: "制造补料功能需求", //用途
        Remarks: "制造补料", //备注
        creater: creater,
        creatdate: creatdate,
        status: "0",
    };
    let forss = {
        OrderNumber: OrderNumbers, //计算出本次订单编号
        MaterialNumber: row.MaterialNumber, //产品编号
        MaterialName: row.MaterialName, //产品名称
        MaterialPrice: "", //产品价格
        Thumbnail: "",
        MaterialSpec: "",
        Number: ReplenishmentNumber, //产品数量
        PNum: ReplenishmentNumber, //计划数
        jine: "", //金额
        tjine: "", //总金额
        creater: creater,
        creatdate: creatdate,
        status: "0",
    };
    await apiModel.insert({ table: 'salesOrder', form: fors });
    //2.添加订单明细
    await apiModel.insert({ table: 'salesOrderDetail', form: forss });
    //3.修改补料记录
    apiModel.update({
        table: "ManufacturingExecutionDetail", id: row._id, form: {
            ReplenishmentOrderNumber: OrderNumbers,
            ReplenishmentNumber: ReplenishmentNumber
        }
    });
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
module.exports = Manufacturing;

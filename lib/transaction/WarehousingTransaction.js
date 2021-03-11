const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });
let dataList = [];//循环存储递归的物料明细
class WarehousingTransaction {
    static async WarehousingTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await Warehousing(data.form, data.row, data.Purpose, data.creater, data.creatdate);
        } catch (err) {
            console.log("err====", err)
            status = false;
            // returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status, data: returndata
        };
    }
    //材料出库展开
    static async materialCKZKTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        // loginName = data.loginName;
        // times = data.times;
        try {
            await CLCKzkMeterial(data.productsh)
            status = true;
        } catch (err) {
            console.log("err...", err);
            status = false;
            returnData = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }
        let flag = true;
        let len = 0

        while (flag) {
            await sleep(500);
            if (dataList.length != len) {
                len = dataList.length;
            } else {
                flag = false;
            }

        }
        dataList = jsNums(dataList, "MaterialNumber", "Number");
        console.log("dataList===", dataList)
        ctx.body = {
            status: status, data: dataList
        };
    }
    //仓库物料取出
    static async materialDeliveryTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await materialDelivery(data.datas, data.jsr, data.idArray, data.SNarray, data.clckdh, data.Proportioner);
        } catch (err) {
            console.log("err====", err)
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

async function Warehousing(form, row, Purpose, creater, creatdate) {
    form.PlanNumber = row.PlanNumber;
    form.OKNumber = row.OKNumber;
    form.MaterialNumber = row.MaterialNumber; //物料编号
    form.OrderNumber = row.OrderNumber; //订单编号
    let drknum = parseInt(form.OKNumber) - parseInt(form.FirmOKNumber);
    let stus = "0";
    if (drknum == 0) {
        stus = "1";
    }
    let fs = {
        OKNumber: drknum < 0 ? "0" : drknum + "",
        FirmOKNumber: form.FirmOKNumber,
        status: stus,
    };
    apiModel.update({ table: "Warehousing", id: row._id, form: fs });
    //插入仓库
    //1.找寻仓库是否存在
    let res = await apiModel.find({ table: "stock", where: { MaterialNumber: row.MaterialNumber } });
    if (res.length == 0) {
        let dt = {
            MaterialNumber: row.MaterialNumber, //物料编号
            MaterialName: row.MaterialName, //物料名称
            MaterialSpec: row.MaterialSpec, //规格型号
            Thumbnail: row.Thumbnail, //缩略图
            Number: form.FirmOKNumber, //数量
            Location: row.Location, //库位
            MaterialSource: row.MaterialSource, //材料来源
            SYNumber: form.FirmOKNumber, //剩余数
            Company: row.Company,
            Status: "0", //状态
            creater: creater, //创建人
            creatdate: creatdate, //创建时间
        };
        apiModel.insert({ table: 'stock', form: dt });
    } else {
        let tempd = JSON.parse(JSON.stringify(res[0]));
        let ids = tempd._id;
        tempd.Number = parseInt(tempd.Number) + parseInt(form.FirmOKNumber);
        tempd.SYNumber = parseInt(tempd.SYNumber) + parseInt(form.FirmOKNumber);
        delete tempd._id;
        apiModel.update({ table: "stock", id: ids, form: tempd });
    }
    //插入盈余
    if (Purpose.indexOf("物料备库") > -1) {

        let resqq = await apiModel.find({ table: "YYB", where: { MaterialNumber: form.MaterialNumber } });
        apiModel.updateByWhere({
            table: "YYB",
            where: { MaterialNumber: form.MaterialNumber },
            form: { Number: parseInt(resqq[0].Number) + parseInt(form.FirmOKNumber) + "" }
        });//盈余表
        apiModel.insert({ table: 'YYBJL', form: { OrderNumber: row.OrderNumber, MaterialNumber: row.MaterialNumber, Number: form.FirmOKNumber } });
    }
}

async function materialDelivery(datas, jsr, idArray, SNarray, clckdh, Proportioner) {
    let temptt = [];
    for (let i = 0; i < datas.length; i++) {
        const MaterialNumber = datas[i].MaterialNumber;
        const Number = parseInt(datas[i].Number); //int,需求数
        let num = 0;
        //查询商店
        let res = await apiModel.find({ table: "stock", where: { MaterialNumber: MaterialNumber } });
        if (res.length > 0)
            num = parseInt(res[0].Number);
        let n = num - Number;
        temptt.push({
            MaterialNumber: MaterialNumber,
            Number: n + "",
        });
    }
    for (let j = 0; j < temptt.length; j++) {
        //修改库存
        await apiModel.updateByWhere({ table: "stock", where: { MaterialNumber: temptt[j].MaterialNumber }, form: { Number: temptt[j].Number } });
    }
    //修改表单状态（1，不显示）
    let forms = {
        status: "1",
        CLCKNumber: clckdh,
        jsr: jsr,
        Proportioner: Proportioner,
    }

    for (let k = 0; k < SNarray.length; k++) {
        await apiModel.updateByWhere({
            table: "ManufacturingExecution", where: { SN: SNarray[k] }, form: { status: "0", IsDeliverGoods: "制造执行" }
        });
    }
    for (let k = 0; k < idArray.length; k++) {
        await apiModel.update({
            table: "materialDelivery", id: idArray[k], form: forms
        });
    }
}
async function CLCKzkMeterial(productsh) {
    dataList = [];//存储物料明细
    for (let i = 0; i < productsh.length; i++) {
        if (productsh[i].Number == "0") continue;
        //查询出每个产品的详细信息
        let datas1 = await apiModel.find({ table: "__basicMaterialList", dataBase: "base", where: { MaterialNumber: productsh[i].MaterialNumber } });
        let cds = productsh[i];
        cds.MaterialSpec = datas1[0].MaterialSpec;
        cds.MaterialTexture = datas1[0].MaterialTexture;
        cds.Company = datas1[0].Company;
        cds.datas1Enclosure = datas1[0].datas1Enclosure;
        getzk(cds);
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
        dataList.push(product);
        return;
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
module.exports = WarehousingTransaction;

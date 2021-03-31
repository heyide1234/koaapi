
const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });
let dataList = [];//循环存储递归的物料明细
class goodsWarehousingTransaction {
    //成品入库
    static async goodsWarehousingTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await goodsWarehousing(data.row, data.Purpose, data.vd, data.datatemp, data.creater, data.creatdate);
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
    //成品出库
    static async goodsDeliveryTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await goodsDelivery(data.datas, data.temparrs, data.seleArrT, data.Proportioner);
        } catch (err) {
            console.log("err====", err)
            status = false;
            returndata = `[MongoDB] ERROR: ${err}`;

        } finally {
            console.log('completed!');
        }
        ctx.body = {
            status: status, data: returndata
        };
    }

}

async function goodsWarehousing(row, Purpose, vd, datatemp, creater, creatdate) {
    //1.增加库存
    let res = await apiModel.find({ table: "stock", where: { MaterialNumber: row.MaterialNumber } });
    if (res.length == 0) {
        let v = {
            MaterialNumber: row.MaterialNumber, //物料编号
            MaterialName: row.MaterialName, //物料名称
            MaterialSpec: row.MaterialSpec, //规格型号
            Thumbnail: row.Thumbnail, //缩略图
            Number: row.Number + "", //数量
            Location: row.Location, //库位
            MaterialSource: row.MaterialSource, //材料来源
            SYNumber: row.Number + "", //剩余数量
            Status: "0", //状态
            creater: creater, //创建人
            creatdate: creatdate, //创建时间
        };
        apiModel.insert({ table: 'stock', form: v });
    } else {
        let num = parseInt(res[0].Number) + parseInt(row.Number);
        let num1 = parseInt(res[0].SYNumber) + parseInt(row.Number);
        await apiModel.updateByWhere({ table: "stock", where: { MaterialNumber: row.MaterialNumber }, form: { Number: num + "", SYNumber: num1 + "" } });
    }
    //2.修改SN状态 status=3
    // await apiModel.updateByWhere({ table: "ManufacturingExecution", where: { MaterialNumber: row.MaterialNumber, status: "2" }, form: { status: "3" } });
    // //3.修改SN流转状态
    for (let ks = 0; ks < datatemp.length; ks++) {

        await apiModel.updateByWhere({ table: "ManufacturingExecution", where: { SN: datatemp[ks].SN, }, form: { status: "3", IsDeliverGoods: "制造已入库" } });
    }

    //4.添加到成品入库单记录
    apiModel.insert({ table: 'goodsWarehousing', form: vd });

    //插入盈余
    if (Purpose.indexOf("成品备库") > -1) {
        let resqq = await apiModel.find({ table: "YYB", where: { MaterialNumber: row.MaterialNumber } });
        apiModel.updateByWhere({
            table: "YYB",
            where: { MaterialNumber: row.MaterialNumber },
            form: { Number: parseInt(resqq[0].Number) + parseInt(row.Number) + "" }
        });//盈余表
        apiModel.insert({ table: 'YYBJL', form: { OrderNumber: row.OrderNumber, MaterialNumber: row.MaterialNumber, Number: row.Number } });
    }
}
//成品出库
async function goodsDelivery(datas, temparrs, seleArrT, Proportioner) {
    for (let j = 0; j < datas.length; j++) {
        let res = await apiModel.find({ table: "stock", where: { MaterialNumber: datas[j].MaterialNumber } });//库存查询
        apiModel.updateByWhere({ table: "stock", where: { MaterialNumber: datas[j].MaterialNumber }, form: { Number: parseInt(res[0].Number) - parseInt(datas[j].Number) + "" } });
    }
    for (let m = 0; m < temparrs.length; m++) {

        apiModel.updateByWhere({ table: "ManufacturingExecution", where: { SN: temparrs[m] }, form: { IsDeliverGoods: "制造出货", } });

    }
    //修改表单状态（1，不显示）
    for (let k = 0; k < seleArrT.length; k++) {
        apiModel.update({
            table: "goodsDelivery", id: seleArrT[k]._id, form: {
                status: "1",
                Proportioner: Proportioner
            }
        });
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
module.exports = goodsWarehousingTransaction;

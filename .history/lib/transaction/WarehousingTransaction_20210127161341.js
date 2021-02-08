const apiModel = require("../apiModel.js");
//  await apiModel.find({ table: "salesOrderDetail", where: { OrderNumber: OrderNumber } });
// apiModel.insert({ table: 'MaterialDemand', form: datas[i] });
// apiModel.update({ table: "PurchaseOrder", id: row._id, form: fs });
// apiModel.updateByWhere({ table: "salesOrder", where: { OrderNumber: tempsd.OrderNumber }, form: { processCode: "6" } });

class WarehousingTransaction {
    static async WarehousingTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await Warehousing(data.form, data.row, data.creater, data.creatdate);
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
    //物料展开
    static async materialDeliveryTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await materialDelivery(data.datas, data.jsr, data.idArray, data.clckdh, data.Proportioner);
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

async function Warehousing(form, row, creater, creatdate) {
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
}

async function materialDelivery(datas, jsr, idArray, clckdh, Proportioner) {
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
        CLCKNumber: CLCKNumber,
        jsr: jsr,
        Proportioner: Proportioner,
    }
    for (let k = 0; k < idArray.length; k++) {
        await updatecod(idArray[k], clckdh, jsr);
        await apiModel.update({
            table: "materialDelivery", id: idArray[k], form: {
                status: "1",
                CLCKNumber: CLCKNumber,
                jsr: jsr,
                Proportioner: Proportioner,
            }
        });
    }
}
async function updateStore(a, b) {
    await this.$https({
        //这里是你自己的请求方式、url和data参数
        method: "post",
        url: "/api/apiModel/updateByWhere",
        data: {
            table: "stock",
            where: {
                MaterialNumber: a,
            },
            form: {
                Number: b,
            },
        },
    })
        .then((res) => {
            console.log(res);
        })
        .catch(function (err) {
            console.log(err);
        });
}
async function updatecod(ids, CLCKNumber, jsr) {
    await this.$https({
        //这里是你自己的请求方式、url和data参数
        method: "post",
        url: "/api/apiModel/update",
        data: {
            table: "materialDelivery",
            id: ids,
            form: {
                status: "1",
                CLCKNumber: CLCKNumber,
                jsr: jsr,
                Proportioner: sessionStorage.getItem("loginName"),
            },
        },
    })
        .then((res) => {
            console.log(res);
        })
        .catch(function (err) {
            console.log(err);
        });
}
module.exports = WarehousingTransaction;

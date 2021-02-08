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
    form.FirmOKNumber = form.FirmOKNumber || "0";
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
        FirmOKNumber: this.form.FirmOKNumber,
        status: stus,
    };
    this.update(fs, row._id);
    //插入仓库
    //1.找寻仓库是否存在

    let res = await this.findck(row.MaterialNumber);

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
        this.ckinsert(dt);
    } else {
        let tempd = JSON.parse(JSON.stringify(res[0]));
        let ids = tempd._id;
        tempd.Number = parseInt(tempd.Number) + parseInt(form.FirmOKNumber);
        tempd.SYNumber = parseInt(tempd.SYNumber) + parseInt(form.FirmOKNumber);
        delete tempd._id;
        this.ckupdate(tempd, ids);
    }
}
function update(v, ids) {
    //   if (this.auth()) return;
    this.$https({
        method: "post",
        url: "/api/apiModel/update",
        data: {
            table: "Warehousing",
            form: v,
            id: ids,
        },
    })
        .then((res) => {
            console.log(res);
            //将溢出的采购数插入盈余表中
            this.insertyyb();
        })
        .catch((err) => {
            console.log(err);
        });
}
async function findck(MaterialNumbers) {
    let stsdata = [];
    await this.$https({
        method: "get",
        url: "api/apiModel/find",
        params: {
            table: "stock",
            where: {
                MaterialNumber: MaterialNumbers,
            },
        },
    })
        .then((res) => {
            stsdata = res;
        })
        .catch((err) => {
            console.log(err);
        });
    return stsdata;
}
module.exports = WarehousingTransaction;

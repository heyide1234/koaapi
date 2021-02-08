const apiModel = require("../apiModel.js");

class IncomingCheckTransaction {
    static async IncomingCheckTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;
        try {
            returndata = await IncomingCheck(data.form, data.row, data.TotalCheckNum, data.Checker, data.time);
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

async function IncomingCheck(form, row, TotalCheckNum, Checker, time) {
    form.NGNum = form.NGNum || "0";
    let stu = "0";
    if (parseInt(row.ActualNumber) === TotalCheckNum) {
        stu = "1";
    }
    if (parseInt(row.ActualNumber) < TotalCheckNum) {
        stu = "1";
    }
    let fs = {
        TotalCheckNum: TotalCheckNum,
        CheckNum: form.CheckNum,
        NGNum: form.NGNum,
        CheckRemarks: form.CheckRemarks,
        status: stu,
        Checker: Checker,
        creatdate: time,
    };
    update(fs, row._id); //修改检验数据
    ////////////////////////////////////////////////////////////
    //增加材料入库单
    let rkdata = JSON.parse(JSON.stringify(row));
    let nusd = parseInt(form.CheckNum) - parseInt(form.NGNum);
    if (nusd > 0) {
        rkdata.TotalCheckNum = TotalCheckNum;
        rkdata.CheckNum = form.CheckNum;
        rkdata.NGNum = form.NGNum;
        rkdata.CheckRemarks = form.CheckRemarks;
        rkdata.OKNumber = nusd + "";
        rkdata.FirmOKNumber = "0";
        rkdata.status = "0";
        rkdata.Checker = Checker;
        rkdata.creatdate = time;
        delete rkdata._id;
        rkinsert(rkdata); //入库
    }
    //增加退货单
    if (form.NGNum > 0) {
        let thdata = JSON.parse(JSON.stringify(row));
        thdata.TNumber = form.NGNum; //退货数量
        thdata.RNumbers = "0"; //还货总计
        thdata.RNumber = "0"; //本次还货数量
        thdata.status = "0";
        thdata.Checker = Checker; //质检人
        thdata.creatdate = time;
        thdata.CheckerRemarks = form.CheckRemarks; //质检结果
        delete thdata._id;
        thinsert(thdata); //添加退货单
    }
    //进入推单模式
    getProcessState(row.OrderNumber, "7");
}
async function update(v, ids) {
    //if (this.auth()) return;
    await this.$https({
        method: "post",
        url: "/api/apiModel/update",
        data: {
            table: "IncomingCheck",
            form: v,
            id: ids,
        },
    })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
}
async function rkinsert(v) {
    this.$https({
        method: "post",
        url: "/api/apiModel/insert",
        data: {
            table: "Warehousing",
            form: v,
        },
    })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
}
async function thinsert(v) {
    this.$https({
        method: "post",
        url: "/api/apiModel/insert",
        data: {
            table: "ReturnOrder",
            form: v,
        },
    })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
}
async function getProcessState(orderNumber, processCode) {
    this.$https({
        method: "get",
        url: "/api/apiModel/find",
        params: {
            table: "salesOrder",
            where: { OrderNumber: orderNumber },
        },
    })
        .then((res) => {
            if (parseInt(res[0].processCode) < parseInt(processCode)) {
                ///进入推单模式
                this.$https({
                    method: "post",
                    url: "/api/apiModel/updateByWhere",
                    data: {
                        table: "salesOrder",
                        where: { OrderNumber: orderNumber },
                        form: { processCode: processCode },
                    },
                })
                    .then((res) => {
                        console.log(res);
                        this.find();
                        this.tableData1 = [];
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        })
        .catch((err) => {
            console.log(err);
        });
}
module.exports = IncomingCheckTransaction;

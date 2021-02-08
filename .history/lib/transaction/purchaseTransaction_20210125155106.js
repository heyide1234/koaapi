const apiModel = require("../apiModel.js");

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
let loginName = null;//创建人
let times = null;//当前时间
class salesOrderTransaction {
    static async JSCGDNOTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;

        try {
            returndata = await JSCGDNO();
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

    static async SCCGDTransaction(ctx) {
        let data = null;
        let status = true;
        let returndata = null;
        data = ctx.request.method.toLowerCase() == "get" ? ctx.request.query : ctx.request.body;

        try {
            returndata = await SCCGD(data.form, data.row, data.Purpose, data.time);
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

async function JSCGDNO() {
    //1.查询当天的po单号
    let dt = new Date();
    let Y = dt.getFullYear() + "";
    let M = dt.getMonth() + 1 + "";
    let D = dt.getDate() + "";
    M = M.padStart(2, "0");
    D = D.padStart(2, "0");
    let ces = parseInt(Y + M + D + "000"); //初始采购单号
    let cdss = { PurchaseNumber: { $regex: Y + M + D + "" } };
    let cgd = [];
    //查询当天最高采购单号
    cgd = await apiModel.find({ table: "IntransitOrder", where: cdss });
    //去掉无效的采购单号
    cgd = cgd.filter((item) => {
        return item.PurchaseNumber != "";
    });
    if (cgd.length > 0) {
        cgd.sort((a, b) => {
            return parseInt(a.PurchaseNumber) - parseInt(b.PurchaseNumber);
        });
        ces = parseInt(cgd[cgd.length - 1].PurchaseNumber); //最高采购单号
    }
    return ces + 1 + "";

}
//生成采购单
async function SCCGD(form, row, Purpose, time) {
    let cd = parseInt(form.SurplusDistribution) - parseInt(form.PlanNumber); //剩余分配数
    let temp = "0";
    if (cd < 0) {
        updateyyb(form.MaterialNumber, Math.abs(cd)); //盈余表
    }
    if (cd <= 0) {
        temp = "1";
    }
    let fs = {
        PlanNumber: form.PlanNumber,
        SurplusDistribution: cd > 0 ? cd + "" : "0",
        status: temp,
    };
    //修改采购单
    await update(fs, row._id);
    tempsd.PurchaseNumber = form.PurchaseNumber; //采购编号
    tempsd.CheckNumber = ""; //质检单号
    tempsd.supplierNumber = form.supplierNumber; //供应商编号
    tempsd.PlannedDeliveryDate = form.PlannedDeliveryDate; //计划交期
    tempsd.supplierName = form.supplierName; //供应商名称
    tempsd.Contacts = form.Contacts; //
    tempsd.ContactsPhone = form.ContactsPhone; //
    tempsd.Purpose = Purpose;
    tempsd.ActualNumber = "";
    tempsd.ActualNumbertotal = "0";
    tempsd.ShouldNumber = form.PlanNumber;
    tempsd.ActualPrice = form.ActualPrice;
    tempsd.SYtotal = form.PlanNumber;
    tempsd.Monry = "";
    tempsd.tMonry = "";
    tempsd.status = "0";
    tempsd.creatdate = time; //创建时间
    delete tempsd.PlanNumber;
    delete tempsd._id;
    //在途插入
    ztinsert(tempsd);
    //采购单头添加
    insertPurshHead(tempsd, time);

    //进入推单模式
    getProcessState(row.OrderNumber, "PurchaseOrder", "1", "5");

}
async function insertPurshHead(tempsd, time) {
    let tempsC = {
        OrderNumber: tempsd.OrderNumber, //订单编号
        PurchaseNumber: tempsd.PurchaseNumber, //采购编号
        supplierNumber: tempsd.supplierNumber, //供应商编号
        supplierName: tempsd.supplierName, //供应商名称
        Contacts: tempsd.Contacts, //联系人
        ContactsPhone: tempsd.ContactsPhone, //联系人电话
        TotalAmount: "", //总金额
        creatdate: time, //创建时间
    };

    this.$https({
        method: "get",
        url: "/api/apiModel/find",
        params: {
            table: "CGDhead",
            where: { PurchaseNumber: tempsd.PurchaseNumber },
        },
    })
        .then((res) => {
            console.log(res);
            if (res.length == 0) {
                this.$https({
                    method: "post",
                    url: "/api/apiModel/insert",
                    data: {
                        table: "CGDhead",
                        form: tempsC,
                    },
                })
                    .then((res) => {
                        console.log(res);
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
//在途单插入
async function ztinsert(v) {
    await this.$https({
        method: "post",
        url: "/api/apiModel/insert",
        data: {
            table: "IntransitOrder",
            form: v,
        },
    })
        .then((res) => {
            console.log(res);
            //将溢出的采购数插入盈余表中
        })
        .catch((err) => {
            console.log(err);
        });
}
//数据修改
async function update(v, ids) {
    //   if (this.auth()) return;
    await this.$https({
        method: "post",
        url: "/api/apiModel/update",
        data: {
            table: "PurchaseOrder",
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
async function getProcessState(orderNumber, table, statusing, processCode) {
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
//盈余表
async function updateyyb(materialNumber, num) {
    let pynum = await goYYB(materialNumber); //盈余表当前物料数量
    let yynum = pynum + num; //修改为当前数量
    updateYYB(materialNumber, yynum + "");
}
// 根据物料编码修改数量
async function updateYYB(materialNumber, num) {
    this.$https({
        //这里是你自己的请求方式、url和data参数
        method: "post",
        url: "/api/apiModel/updateByWhere",
        data: {
            table: "YYB",
            form: { Number: num },
            where: { MaterialNumber: materialNumber },
        },
    })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
}
//算出盘盈数
async function goYYB(materialNumber) {
    let tempNum = 0;
    await this.$https({
        method: "get",
        url: "/api/apiModel/find",
        params: {
            table: "YYB",
            where: { MaterialNumber: materialNumber },
        },
    })
        .then((res) => {
            if (res.length > 0) {
                tempNum = parseInt(res[0].Number);
            } else {
                this.$https({
                    //这里是你自己的请求方式、url和data参数
                    method: "post",
                    url: "/api/apiModel/insert",
                    data: {
                        table: "YYB",
                        form: {
                            MaterialNumber: materialNumber, //物料编号
                            Number: "0", //数量
                        },
                    },
                })
                    .then(function (res) {
                        console.log(res);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        })
        .catch((err) => {
            console.log(err);
        });
    return tempNum;
}


module.exports = salesOrderTransaction;

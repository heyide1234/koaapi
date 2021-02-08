
var num = 0;
var obj = {};
class apiController {

    static transactions(ctx) {
        console.log(ctx, num);
        if (ctx.sesstionID == 0) {
            obj[num++] = { "table1": 1, "table2": 2 }
        }
        console.log(obj);
        ctx.body = num;
    }

    static getsesstionId() {
        ctx.body = num++;
    }



}


module.exports = apiController;

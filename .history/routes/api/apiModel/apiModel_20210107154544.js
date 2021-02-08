const router = require("koa-router")();
const controller = require("../../../controller/api/apiModel/apiModel");
const fs = require("fs");


router.prefix("/api");

router.get("/", async (ctx, next) => {
  ctx.body = "apis";
});

//根据条件删除
router.post("/apiModel/deleteByWhere", controller.deleteByWhere);
//根据条件删除
router.post("/apiModel/delete", controller.delete); //test
//根据ID修改
router.post("/apiModel/update", controller.update);
//根据条件修改
router.post("/apiModel/updateByWhere", controller.updateByWhere);

//新增
router.post("/apiModel/insert", controller.insert);
//根据skip数目实现分页查询
router.get("/apiModel/findByPageNum", controller.findByPageNum);
//获取总条数
router.get("/apiModel/getpage", controller.getpage);

//查询
router.get("/apiModel/find", controller.find);



////////////////////





const formidable = require("formidable");
const bluebird = require("bluebird");


router.post('/apiModel/base64', (ctx, next) => {
  var form = new formidable.IncomingForm();
  bluebird.promisify(form.parse);

  form.parse(ctx.req, function (err, fields) {
    if (err) { throw err; return; }
    console.log("--------------", fields);//{ name: base64字符串 }
    ctx.body = fields.name
  });


});




module.exports = router;

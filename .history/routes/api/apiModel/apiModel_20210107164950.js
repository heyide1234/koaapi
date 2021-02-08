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


router.post('/getfile', async (ctx, next) => {
  fs.readFile('\\172.16.1.10\Fujian\销售订单\9202103032221', function (err, data) {
    if (err) {
      res.writeHeader(404, {
        'content-type': 'text/html;charset="utf-8"'
      });
      res.write('<h1>404错误</h1><p>你要找的页面不存在</p>');
      res.end();
    } else {
      res.writeHeader(200, {
        'content-type': 'text/html;charset="utf-8"'
      });
      res.write(data);//将index.html显示在客户端
      res.end();

    }

  });

});




////////////////////


module.exports = router;

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



// const app1 = new Koa();
////////////////////
app.use(koaBody({
  multipart: true, // 开启文件上传
  formidable: {
    maxFileSize: 200 * 1024 * 1024,    // 设置上传文件大小最大限制，默认2M
    keepExtensions: true // 保留文件拓展名
  }
}))
router.post('/uploadfile', async (ctx, next) => {
  // 上传单个文件
  const file = ctx.request.files.file; // 获取上传文件
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  let filePath = path.join(__dirname, 'public/upload/') + `/${file.name}`;
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);
  return ctx.body = "上传成功！";
});



module.exports = router;

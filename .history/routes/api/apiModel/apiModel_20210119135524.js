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


var path = require('path');
router.post('/upload', function (req, res) {
  /* 生成multiparty对象，并配置上传目标路径 */
  var dsrc = path.join(__dirname, "upload")

  var form = new multiparty.Form();
  /* 设置编辑 */
  form.encoding = 'utf-8';
  //设置文件存储路径
  form.uploadDir = dsrc;
  //设置文件大小限制
  form.maxFilesSize = 2 * 1024 * 1024;
  // form.maxFields = 1000;  //设置所有文件的大小总和
  //上传后处理
  form.parse(req, function (err, fields, files) {

    var dstPath;
    var uploadedPath;
    var inputFile;
    var filesTemp = JSON.stringify(files, null, 2);
    if (err) {
      console.log('parse error:' + err);
    } else {
      inputFile = files.file[0];
      uploadedPath = inputFile.path;
      dstPath = dsrc + inputFile.originalFilename;
      //重命名为真实文件名
      fs.rename(uploadedPath, dstPath, function (err) {
        if (err) {
          console.log('rename error:' + err);
        } else {
          console.log('rename ok');
        }
      })
    }
    // res.writeHead(200, { 'content-type': 'text/plain;charset=utf-8' });
    // res.write(dstPath + "-----" + uploadedPath + "----" + inputFile.originalFilename);
    res.end()
  })
})



router.get('/test', (req, res) => {
  try {
    res.set({
      // "Content-Type": "application/octet-stream",//告诉浏览器这是一个二进制文件
      // "Content-Disposition": "attachment; filename=" + req.query.name //告诉浏览器这是一个需要下载的文件
    });
    fs.createReadStream('./public/upload/' + req.query.name).pipe(res);
  } catch (e) {
    console.log('出错了' + e);
  }
});


//////////////////////////////
module.exports = router;

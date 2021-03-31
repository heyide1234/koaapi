const Koa = require("koa");

const koaBody = require('koa-body')
const path = require('path')
const app = new Koa();



// ... 

//跨域
var cors = require("koa2-cors");
app.use(cors());
// app.all('*', function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//   res.header("X-Powered-By", ' 3.2.1')
//   res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");

const index = require("./routes/index");
const users = require("./routes/users");
//restful api
const workOrderHead = require("./routes/api/workOrderHead/workOrderHead");
const processList = require("./routes/api/processList/processList");
const batching = require("./routes/api/batching/batching");
const picking = require("./routes/api/picking/picking");
const summary = require("./routes/api/summary/summary");
const user = require("./routes/api/user/user");

const apiModel = require("./routes/api/apiModel/apiModel");



// error handler
onerror(app);

// middlewares
// app.use(
//   bodyparser({
//     enableTypes: ["json", "form", "text"],
//   })
// );
app.use(
  bodyparser({
    json: { limit: '100mb' },
  })
);
//设置传输数据大小限制
app.use(bodyparser({
  formLimit: "3mb",
  jsonLimit: "3mb",
  textLimit: "3mb",
  enableTypes: ['json', 'form', 'text']
}));

app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());

app.use(workOrderHead.routes(), workOrderHead.allowedMethods());
app.use(processList.routes(), processList.allowedMethods());
app.use(batching.routes(), batching.allowedMethods());
app.use(picking.routes(), picking.allowedMethods());
app.use(summary.routes(), summary.allowedMethods());
app.use(user.routes(), user.allowedMethods());

app.use(apiModel.routes(), apiModel.allowedMethods());



app.use(koaBody({
  multipart: true, // 开启文件上传
  formidable: {
    maxFileSize: 200 * 1024 * 1024,    // 设置上传文件大小最大限制，默认2M
    keepExtensions: true // 保留文件拓展名
  }
}))


// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;

const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index');
const wechat = require('./routes/wechat');
const door = require('./routes/door');
const behavior = require('./routes/behavior');
const every = require('./routes/everyDayData');
const storyRules = require('./routes/storyRules')
const jpush=require('./routes/jPush');
const servers=require('./routes/servers');
const activatedLog=require('./routes/activatedLog');
const userFace=require('./routes/userFace');
const faceDoorMachine=require('./routes/FaceDoorMachine');
const userFaceMQ=require('./routes/userFaceMQ');
const kafka=require('./routes/Kafka');





// 报错
onerror(app)

// 中间件
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
    extension: 'pug'
}))

// 日志
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 路由
app.use(index.routes(), index.allowedMethods());
app.use(wechat.routes(), wechat.allowedMethods());
app.use(door.routes(), door.allowedMethods());//门操作
app.use(behavior.routes(), behavior.allowedMethods());//用户行为
app.use(every.routes(), every.allowedMethods()); //每天数据记录
app.use(storyRules.routes(), storyRules.allowedMethods());//根据规则获取数据
app.use(jpush.routes(),jpush.allowedMethods());//极光推送
app.use(activatedLog.routes(),activatedLog.allowedMethods());//审核相关
/**后台服务*/
app.use(servers.routes(),servers.allowedMethods());
/**人脸识别*/
app.use(userFace.routes(),userFace.allowedMethods());
/**人脸门口机 */
app.use(faceDoorMachine.routes(),faceDoorMachine.allowedMethods());
/**用户刷脸开门门权限消息 */
app.use(userFaceMQ.routes(),userFaceMQ.allowedMethods());
/**kafka */
app.use(kafka.routes(),kafka.allowedMethods());


module.exports = app
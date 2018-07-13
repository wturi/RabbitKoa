const router = require('koa-router')()
const koaBody = require('koa-body');

const schedule = require('../dlls/schedule');
const ys7Push = require('../dlls/ys7Push');

router.prefix('/server');

router.get('/', async (ctx, next) => {
    ctx.body = {
        Code: 200,
        Info: 'This is servers'
    }
})

router.get('/open', async (ctx, next) => {
    schedule.schedule();
    ys7Push.ys7Push.open();
    ctx.body = {
        Code: 200,
        Info: '操作成功'
    }
})

module.exports = router


const router = require('koa-router')()
const behavior = require('../dlls/behavior');

router.prefix('/behavior')

router.get('/', async (ctx, next) => {
    ctx.body = {
        title: 'this is a behavior!'
    }
})

router.post('/Insert', async (ctx, next) => {
    let code = behavior.Insert(ctx.request.body);
    ctx.body = {
        code: code,
        info: 'this is behavior-insert'
    }
})
module.exports = router
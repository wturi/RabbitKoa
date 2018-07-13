const router=require('koa-router')()

router.prefix('/every');

router.get('/', async (ctx, next) => {
    ctx.body = {
        title: 'this is a every!'
    }
})


router.post('/insert', async (ctx, next) => {
    ctx.body = {
        title: 'this is insert'
    };
})

module.exports=router;
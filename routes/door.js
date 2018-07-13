const router = require('koa-router')()
const koaBody = require('koa-body');
const door = require('../dlls/door')
const doorKafka=require('../dlls/doorKafka');

const doorJingAn=require('../dlls/doorJingAn');


router.prefix('/door')

router.get('/', async (ctx, next) => {
    ctx.body = {
        title: 'this is a openDoorLog!'
    }
})


/**
 * 添加kafka数据
 */
router.get('/InsertKafka/:id',async (ctx,next)=>{
    doorKafka.UploadDoorOpenLog(ctx.params.id);
    ctx.body={
        status:200,
        info:'this is insertKafka'
    }
})

/**
 * 获取开门记录
 */
router.post('/get', async (ctx, nex) => {
    door.Get.All();
    ctx.body = {
        Code: 200,
        Info: ''
    }
})

/**
 * 添加开门记录
 */
router.post('/Insert', async (ctx, next) => {
    var isbool = await door.Insert.One(ctx.request.body)
    ctx.body = {
        status: isbool,
        info: 'this is doorInsert'
    }
})


module.exports = router
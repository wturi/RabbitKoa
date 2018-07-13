const router = require('koa-router')()
const koaBody = require('koa-body');

const kafka = require('../dlls/doorKafka');

router.prefix('/kafka')

router.get('/', async (ctx, next) => {
    ctx.body = {
        title: 'this is a kafka!'
    }
})


router.get('/openDoorImg', async (ctx, next) => {
    let villageCode = ctx.query.villageCode;
    let recordId = ctx.query.recordId;
    let cUserId = ctx.query.cUserId;

    let data = await kafka.UploadDoorImg(villageCode, recordId, cUserId);
    ctx.body = {
        Code: 200,
        Info: '操作成功',
        Data: data
    }
})


module.exports = router
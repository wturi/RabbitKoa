const router = require('koa-router')()
const activatedLog = require('../dlls/activatedLog');
const tool = require('../dlls/tools');

router.prefix('/activatedLog')

router.get('/', async (ctx, next) => {
    ctx.body = {
        code: 200,
        info: 'this is activatedLog'
    }
})


router.get('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let data=await activatedLog.Find.ALl(Number(id));
    ctx.body = {
        Code: 200,
        Info: '',
        Data:data
    }
})


router.post('/Insert', async (ctx, next) => {
    let activatedLogPrescriptionId=ctx.request.body.activatedLogPrescriptionId;
    let activatedLogId = ctx.request.body.activatedLogId;
    let json = ctx.request.body.json;
    if (tool.JudgeData(activatedLogId, json)) {
        let code = activatedLog.Insert(activatedLogPrescriptionId,activatedLogId, json);
        ctx.body = {
            Code: code,
            Info: ''
        }
    } else {
        ctx.body = {
            Code: 400,
            Info: '参数缺失'
        }
    }
})

module.exports = router;
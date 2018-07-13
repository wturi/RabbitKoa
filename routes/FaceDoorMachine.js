const router = require('koa-router')()
const koaBody = require('koa-body');
const faceDoorMachine = require('../dlls/FaceDoorMachine');
const door = require('../dlls/door');


router.prefix('/faceDoorMachine')

router.get('/', async (ctx, next) => {
    ctx.body = {
        title: 'this is faceDoorMachine!'
    }
})


router.post('/UfaceUpload', async (ctx, next) => {
    let obj = {
        deviceKey: ctx.request.body.deviceKey,
        time: ctx.request.body.time,
        ip: ctx.request.body.ip,
        personCount: ctx.request.body.personCount,
        faceCount: ctx.request.body.faceCount,
        version: ctx.request.body.version
    }
    faceDoorMachine.Update(obj)

    ctx.body = {
        Code: 200,
        Info: '操作成功'
    }
})



router.post('/CallBack', async (ctx, next) => {
    let obj = {
        ip: ctx.request.body.ip,
        personId: ctx.request.body.personId,
        time: ctx.request.body.time,
        deviceKey: ctx.request.body.deviceKey,
        type: ctx.request.body.type,
        path: ctx.request.body.path
    }
    
    faceDoorMachine.AddCallBack(obj);
    if(obj.personId!='STRANGERBABY'){
        let doorId = await faceDoorMachine.FindOne(obj.deviceKey);
        door.Open.OpenOfNoLocation(obj.personId, doorId.doorId, 2);
    }
    
    ctx.body = {
        result: 1,
        success: true
    }
   
})



router.post('/UpdateCommIdAndDoorId', async (ctx, next) => {
    let deviceKey = ctx.request.body.deviceKey;
    let commId = ctx.request.body.commId;
    let doorId = ctx.request.body.doorId;
    let doorName=ctx.request.body.doorName;
    let commName=ctx.request.body.commName;
    faceDoorMachine.UpdateCommIdAndDoorId(deviceKey, commId, doorId,doorName,commName);
    ctx.body = {
        Code: 200,
        Info: '操作成功'
    }
})


/**
 * 拉取社区设备信息
 */
router.get('/machine/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let data = await faceDoorMachine.Get(id);
    if (data != null) {
        ctx.body = {
            Code: 200,
            Info: '操作成功',
            Data: data
        }
    } else {
        ctx.body = {
            Code: 400,
            Info: '没有数据'
        }
    }
})




module.exports = router
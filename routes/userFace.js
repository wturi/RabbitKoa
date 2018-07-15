const router = require('koa-router')()
const userFace = require('../dlls/userFace');
const tools = require('../dlls/tools');
const base64 = require('base64-img')

router.prefix('/userFace');

router.get('/', async (ctx, next) => {
    ctx.body = {
        code: 200,
        info: 'this is userFace'
    }
})


/**
 * 根据用户id判断是否已经存在人脸
 */
router.get('/:id', async (ctx, next) => {
    let thirdCode = ctx.params.id;
    let data = await userFace.JudgeHaveByCode(thirdCode)

    if (data == null) {
        ctx.body = {
            Code: 301,
            Info: '暂无数据'
        }
    } else {
        ctx.body = {
            Code: 200,
            Info: '操作成功',
            Data: data
        }
    }
})


/**
 *更新或者添加数据
 */
router.post('/Update', async (ctx, next) => {
    let thirdCode = ctx.request.body.thirdCode;
    let phoneNumber = ctx.request.body.phoneNumber;
    let imageUrlPath = ctx.request.body.imageUrlPath;

    let phoneNumberIsBool = tools.JudgeData(thirdCode, phoneNumber);
    let imageUrlPathIsHvar = tools.JudgeData(thirdCode, imageUrlPath);

    if (!phoneNumberIsBool && !imageUrlPathIsHvar) {
        ctx.body = {
            Code: 400,
            Info: '参数缺失'
        };
    } else {
        if (phoneNumberIsBool) await userFace.UpdatePhoneNumber(thirdCode, phoneNumber)
        if (imageUrlPathIsHvar) await userFace.UpdateUserFaceByPhonenumber(thirdCode, imageUrlPath)
        ctx.body={
            Code:200,
            Info:'操作成功',
            Data:await userFace.JudgeHaveByCode(thirdCode)
        }
    }
})

/**
 * 根据凭证查找手机号
 */
router.get('/FindPhone/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let data = await userFace.JudgeHaveByPhoneNumber(id);

    if (data != null) {
        ctx.body = {
            Code: 200,
            Info: '操作成功',
            Data: data
        }
    } else {
        ctx.body = {
            Code: 301,
            Info: '没有数据'
        }
    }
})

/**
 * 推送图片下发到门口机的状态
 */
router.get('/UploadImgPushStates/:id',async(ctx,next)=>{
    let id=ctx.params.id;
    let isBool= ctx.query.isBool;
    let doorName=ctx.query.doorName;
    let commName=ctx.query.commName;
    let data=await userFace.PushStates(id,isBool,doorName,commName);
    ctx.body={
        Code:200,
        Info:'操作成功',
        Data:data
    }
})


module.exports = router
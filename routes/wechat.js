const router = require('koa-router')()

const wechat = require('../dlls/wechatdb')
const mongodb = require('../dlls/mongodb');
const tools = require('../dlls/tools');
const wechatToken=require('../dlls/wechatToken');


router.prefix('/wechat')

/**
 * 更新微信图文消息
 */
router.get('/', async (ctx, next) => {
    wechatToken.GetToken();
    ctx.body = {
        title: 'this is a wechat!'
    }
})


/**
 * 获取微信文章信息
 */
router.get('/Get', async (ctx, next) => {
    let data = mongodb.find.All();
    ctx.body = {
        Code: 200,
        Info: '',
        Data: await data
    };
})



/**
 * 修改文章类型
 */
router.post('/update', async (ctx, next) => {
    let _id = ctx.request.body.id;
    let type = ctx.request.body.type;
    let isbool = tools.JudgeData(_id, type);
    if (isbool) {
        ctx.body = {
            Code: 200,
            Info: '',
            Data: await mongodb.update.storyType(_id, type)
        };
    } else {
        ctx.body = {
            Code: 400,
            Info: '参数缺失'
        };
    }
})

/**
 * 查询文章连接
 */
router.post('/FindUrl', async (ctx, next) => {
    let title = ctx.request.body.title;
    let isbool = tools.JudgeData(title);
    if (isbool) {
        ctx.body = {
            Code: 200,
            Info: '',
            Data: await mongodb.find.Title(title)
        };
    } else {
        ctx.body = {
            Code: 400,
            Info: '参数缺失'
        };
    }
})

/**
 * 根据文章标题模糊查询
 */
router.post('/find', async (ctx, next) => {
    let title = ctx.request.body.title;
    let isbool = tools.JudgeData(title);
    if (isbool) {
        ctx.body = {
            Code: 200,
            Info: '',
            Data: await mongodb.find.TitleVague(title.trim())
        };
    } else {
        ctx.body = {
            Code: 200,
            Info: '',
            Data:await mongodb.find.All()
        };
    }
})


/**
 * 修改文章是否可看
 */
router.post('/updateShow', async (ctx, next) => {
    let _id = ctx.request.body.id;
    let isshow = ctx.request.body.isshow;
    let isbool = tools.JudgeData(_id, isshow);
    if (isbool) {
        ctx.body = {
            Code: 200,
            Info: '',
            Data: await mongodb.update.isShow(_id, isshow)
        };
    } else {
        ctx.body = {
            Code: 400,
            Info: '参数缺失'
        };
    }
})


/**
 * 添加文章
 */
router.post('/insert',async(ctx ,next)=>{
    let title=ctx.request.body.title;
    let storyType=ctx.request.body.storyType;
    let url=ctx.request.body.url;
    let isbool=tools.JudgeData(title,storyType,url);
    if(isbool){
        ctx.body={
            Code:200,
            Info:'',
            Data:await mongodb.insert.material(title,storyType,url)
        }
    }else{
        ctx.body={
            Code:400,
            Info:'参数缺失'
        }
    }

})


/**
 * 微信信息接口
 */
module.exports = router
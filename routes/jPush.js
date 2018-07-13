const router = require('koa-router')()
const koaBody = require('koa-body');

const jpush = require('../dlls/jPush');
const tools=require('../dlls/tools');

router.prefix('/jpush');

router.get('/',async(ctx,next)=>{
    ctx.body={
        Code:200,
        Info:'this is jpush.'
    }
})

/**
 * 推送全部用户
 */
router.post('/SendALL', async (ctx, next) => {
    let title=ctx.request.body.Title;
    let Content=ctx.request.body.Content;
    let isbool=tools.JudgeData(title,Content);
    if(!isbool){
        ctx.body={
            Code:400,
            Info:'参数缺失'
        }
    }else{
        jpush.Push.All(title,content);
        ctx.body={
            Code:200,
            Info:'操作成功'
        }
    }
})

/**
 * 推送指定用户
 */
router.post('/SendOne',async(ctx,next)=>{
    let alias=ctx.request.body.Alias;
    let title=ctx.request.body.Title;
    let content=ctx.request.body.Content;
    let isbool=tools.JudgeData(alias,title,content);
    if(!isbool){
        ctx.body={
            Code:400,
            Info:'参数缺失'
        }
    }else{
        jpush.Push.One(alias,title,content);
        ctx.body={
            Code:200,
            Info:'操作成功'
        }
    }
})


module.exports = router
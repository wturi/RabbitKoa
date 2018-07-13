const router = require('koa-router')()

const storyRules = require('../dlls/storyRules')
const tools = require('../dlls/tools');
const rules = require('../dlls/rulesOfCommunity');

router.prefix('/storyRules')

router.get('/', async (ctx, next) => {
    ctx.body = {
        title: 'this is a storyRules!'
    }
})

/**
 * 随机获取文章
 */
router.post('/RandomStory', async (ctx, next) => {
    let isbool = tools.JudgeData(ctx.request.body.storytype);
    if (isbool)
        ctx.body = await storyRules.ruleStrategy.RandomStory(ctx.request.body.storytype)
    else
        ctx.body = {}
})

/**
 * 获取最近的一篇文章
 */
router.post('/RecentStory', async (ctx, next) => {
    let isbool = tools.JudgeData(ctx.request.body.storytype);
    if (isbool) {
        ctx.body =await storyRules.ruleStrategy.RecentStory(ctx.request.body.storytype)
    } else {
        ctx.body = {}
    }

})

/**
 * 获取指定文章
 */
router.post('/DesignationStory', async (ctx, next) => {
    ctx.body = storyRules.ruleStrategy.DesignationStory(ctx.request.body.storytype)
})

/**
 * 添加文章
 */
router.post('/insert', async (ctx, next) => {
    rules.openation.insert();
    ctx.body = {
        title: 'insert'
    }
})

/**
 * 根据id获取文章
 */
router.get('/find/:id', async (ctx, next) => {
    ctx.body = {
        StatusCode: 200,
        Info: await rules.openation.find(ctx.params.id)
    }
})



module.exports = router
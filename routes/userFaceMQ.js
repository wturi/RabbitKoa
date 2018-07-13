const router = require('koa-router')()
const userFaceMQ=require('../dlls/userFaceMQ');

router.prefix('/userFaceMQ')

router.get('/',async(ctx,next)=>{
    ctx.body = {
        code: 200,
        info: 'this is userFaceMQ'
    }
})


router.get('/:id',async(ctx,next)=>{
    let commId=ctx.params.id; 
    let data=await userFaceMQ.Get(commId);
    if(data==null){
        ctx.body={
            Code:301,
            Info:'暂无数据'
        }
    }else{
        ctx.body = {
            Code: 200,
            Info: '操作成功',
            Data: data
        }
    }
})



router.get('/update/:id',async(ctx,next)=>{
    let id=ctx.params.id; 
    let data=userFaceMQ.Update(id);
    ctx.body = {
        Code: 200,
        Info: '操作成功'
    }
})


module.exports=router;
const request=require('../dlls/myRequest');
const mongodb=require('../dlls/mongodb');
const wechat=require('../dlls/wechatdb');




function GetToken(){
    request.Push('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx6d69e42f213da2ce&secret=40cbb421813a8b7c98895ea24060ee5a',{},'GET')
    .then(function(u){
        wechat.Get(u.access_token);
    })
}

module.exports.GetToken=GetToken;
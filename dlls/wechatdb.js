const request = require('request');
const sqlserver = require('../dlls/sqldb')
const mongodb = require('../dlls/mongodb');

let access_token = '';
let url = "https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=";
let curPage = 0;
let pageSize = 20;
let totalCount = 0;

let options = {
    headers: { "Connection": "close" },
    url: url + access_token,
    method: "POST",
    json: true,
    body: {
        "type": "news",
        "offset": curPage * pageSize,
        "count": pageSize
    }
};



function Sqlcallback(error, response, data) {
    //console.log(data.total_count);
    totalCount += Number(data.item_count);
    if (!error && response.statusCode == 200) {
        data.item.forEach(function (item) {
            mongodb.ObjToMongo(item.content);
        }, this);
        curPage++;
        if (totalCount < data.total_count) {
            options.body.offset = curPage * pageSize;
            request(options, Sqlcallback);
        }
    }
}


/**
 * 调用sql获取token
 */
function Sql(token) {
    options.url = url + token;
    //console.log(options.url);
    request(options, Sqlcallback);
}




module.exports.Get = Sql;
const schedule = require('node-schedule');
const http = require('http');

const PathUrl = 'http://www.airtu.me:10101/';

/**
 * 定时执行程序
 */
function scheduleCronstyle() {
    schedule.scheduleJob('30 1 1 * * *', function () {
        GetApiAllData();
        UpdateData();
        WechatMa();
        console.log('执行时间:' + new Date() + '\n');
    });
}

/**
 * 公司墙上电视数据记录
 */
function GetApiAllData() {
    http.get(PathUrl + 'api/GetApiALLData/Data', function (res) {
        res.on('data', function (d) {

        })
        res.on('end', function () {
            console.log('GetApiAllData is success')
        })
    })
}

/**
 * 数据更新
 */
function UpdateData() {
    http.get(PathUrl + 'api/UpdateData/Data', function (res) {
        res.on('data', function (d) {

        })
        res.on('end', function () {
            console.log('UpdateData is success')
        })
    }).on('error', function (e) {
        console.error('error')
    })
}

/**
 * 拉取二兔开门公众号图文消息
 */
function WechatMa() {
    http.get('http://localhost:3000/wechat', function (res) {
        res.on('data', function () {

        })
        res.on('end', function () {
            console.log('wechatMa is success')
        })
    }).on('error', function (e) {
        console.error('error');
    })
}

module.exports.schedule = scheduleCronstyle;
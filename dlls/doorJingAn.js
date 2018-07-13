const request = require('request-promise');
const notime = require('notime');
const sql = require('../dlls/sqldb');
const dongfang = require('../dlls/dongfang');
const utils = require('utility');
const querystring = require('querystring');

let apikey = '58a2826c93154cbf8fc25dcd53856e82';
let token = '';

let serverPath = 'https://180.169.39.226:9919';


let baseUserData = {
    user_id: '',
    user_sex: '',
    phone_num: '',
    first_name: ''
};

let baseDeviceData = {
    device_id: '',
    device_name: '',
    latitude: '',
    longitude: '',
    address: '',
    district: '',
    town: ''
}

let baseOpenData = {
    user_id: '',
    door_status: ''
}




/**
 * 推送接口
 * @param {OBJ} obj 
 */
function Push(url, obj, method) {
    let options = {
        url: url,
        method: method,
        body: obj,
        rejectUnauthorized: false
    };
    return request(options);
}


function DeviceEvent(obj) {
    let obj = {
        deviceID: obj.deviceID,
        timestamp: notime.getnowts().strts,
        deviceType: 'VchatDoorOpenSensor',
        data: baseData
    }
    let pr = Push(serverPath + '/v2/device/event?token=' + token, obj, 'POST')
    return pr;
}






/**
 * 获取apikey
 */
function Auth() {
    let pr = Push(serverPath + '/v2/auth?key=' + apikey, null, 'POST');
    pr.then(function (u) {
        let data = JSON.parse(u);
        let token = data.token;
        //console.log(token);
        return token;
    })
    return pr;
}


/**
 * 
 * @param {*} userInfo 
 * @param {*} deviceInfo 
 * @param {*} isSuccess 
 */
module.exports.UploadJingAn = function (userInfo, deviceInfo, openInfo, communityId) {
    Auth().then(function (u) {
        let sqlstr = "select CommunityId from CommunityEntities where Locality like '%静安%'";
        let da = sql.sql(sqlstr, function (err, result) {
            if (err) {
                return;
            }
            let data = result.recordset;
            if (data.length > 0) {
                let isbool = false;
                data.forEach(element => {
                    if (element.CommunityId == communityId) {
                        isbool = true;
                    }
                });

                if (communityId == 4357) {
                    //isbool = true;
                    deviceInfo.longitude = 121.45726;
                    deviceInfo.latitude = 31.314009;
                    deviceInfo.communityName = '松江' + deviceInfo.communityName;
                }

                if (isbool) {
                    DeviceEvent(openInfo, u);
                    DeviceRegister(deviceInfo, u);
                    DeviceEcho(deviceInfo, u);
                }
            }
        });
    });
}




/**
 * 开门状态
 */
function DeviceEvent(obj, u) {
    let json = JSON.parse(u);
    let token = json.token;

    let datajson = JSON.stringify({
        deviceID: obj.device_id,
        timestamp: notime.getnowts().strts.substr(0, 10),
        deviceType: 'WeChatDoorOpen',
        data: {
            user_id: obj.user_id,
            door_status: obj.door_status
        }
    })

    //console.log(datajson);

    let url = serverPath + '/v2/device/event?token=' + token;

    let pr = Push(url, datajson, 'POST');
    pr.then(function (u) {
        //let udata=JSON.parse(u);
        console.log('JingAn_DeviceEvent' + u);
    })
    return pr;
}


/**
 * 设备注册
 * @param {OBJ} obj 数据
 * @param {String} u token
 */
function DeviceRegister(obj, u) {
    let json = JSON.parse(u);
    let token = json.token;

    let jsonData = JSON.stringify({
        deviceID: obj.device_id,
        deviceType: 'WeChatDoorOpen',
        data: {
            floor: 1,
            latitude: obj.latitude,
            longitude: obj.longitude,
            address: obj.address,
            district: '静安区',
            vendor: obj.communityName,
            setup_time: notime.getnowts().strts.substr(0, 10),
            town: '临汾路街道'   //obj.town.split(' ')[1]
        }
    })

    //console.log(jsonData);
    let url = serverPath + '/v2/device/register?token=' + token;
    let pr = Push(url, jsonData, 'POST');
    pr.then(function (u) {
        //let udata=JSON.parse(u);
        //console.log(u)
        console.log('JingAn_DeviceRegister' + u);
    })
    return pr;
}



/**
 * 发送设备心跳
 * @param {OBJ} obj 数据
 * @param {String} u token
 */
function DeviceEcho(obj, u) {
    let json = JSON.parse(u);
    let token = json.token;
    let jsonData = JSON.stringify({
        deviceID: obj.device_id
    });

    let url = serverPath + '/v2/device/echo?token=' + token;
    let pr = Push(url, jsonData, 'POST');
    pr.then(function (u) {
        console.log('JingAn_DeviceEcho' + u);
    })
    return pr;
}
const utils = require('utility');
const request = require('request');

const mssql = require('../dlls/sqldb');
const tools = require('../dlls/tools');
const db = require('../dlls/mongo');
const jingan = require('../dlls/doorJingAn')

const dataVer = '0.1.2';

let firstNameOfUserSchema = new db.mongoose.mongoose.Schema({
    userId: { type: String },
    firstName: { type: String },

})

let firstNameOfUserModel = db.mongoose.db.model('firstNames', firstNameOfUserSchema);


/**
 * 获取门所属社区
 * @param {Number} doorId 门id
 * @param {OBJ} obj 开门数据
 */
function GetCommunityInfo(doorId, obj) {
    let sqlstr = 'select \
    ce.CommunityId as communityId, \
    ce.Locality as locality, \
    ce.Name as communityName, \
    ce.Address as address, \
    d.Name as doorName,\
    dg.Name as doorGroupName ,\
    d.LocationX as latitude,\
     d.LocationY as longitude \
    from Doors d \
    left join DoorGroups dg on d.DoorGroupId=dg.Id  \
    left join CommunityEntities ce on d.CommunityId=ce.CommunityId \
    where d.DoorId=' + doorId;
    mssql.sql(sqlstr, function (err, result) {
        if (err) {
            console.error(err)
            return;
        }
        let data = result.recordset[0];

        obj.doorId = utils.md5(doorId.toString());
        obj.communityName = data.communityName;
        obj.doorName = data.doorGroupName == null
            ? data.doorName
            : data.doorGroupName.split('|')[0] + data.doorName;
        obj.Latitude = data.latitude;
        obj.Longitude = data.longitude;
        obj.locality = data.locality;
        obj.address = data.address
        try {
            GetWechatUserInfo(obj, data.communityId);
        } catch (error) {
            console.error(error);
        }
    })
}



/**
 * 获取用户真实姓名
 * @param {OBJ} obj 用户信息
 */
function GetWechatUserInfo(obj, communityId) {
    let sqlStr = 'select \
    w.UnionId as UnionId, \
    w.Sex as Sex, \
    cu.PhoneNumber as phoneNumber, \
    u.RealName as realName, \
    a.DynamicFieId as dynamicFieId \
    from CommunityUsers cu \
    left join ActivatedLogs a \
    on cu.CommunityUserId=a.CommunityUserId \
    left join Users u \
    on cu.UserId=u.UserId \
    left join WechatUsers w \
    on cu.CommunityUserId=w.CommunityUserId \
    where cu.CommunityUserId='+ obj.userId + ' \
    and a.CommunityId='+ communityId;

    mssql.sql(sqlStr, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        let data = result.recordset[0];


        try {
            let userId = data.UnionId + obj.userId;
            obj.userSex = data.Sex;
            obj.userId = utils.md5(userId);
            obj.phoneNumber = data.phoneNumber.substring(0, 3) + '****' + data.phoneNumber.substring(7);
            obj.firstName = '';
            obj.Ver = dataVer;
        } catch (error) {
            console.error(data);
            return;
        }


        JudgeFirstName(obj).then(function (u) {
            let realName = HandleDynamic(data.realName, data.dynamicFieId);
            obj.firstName = realName == null
                ? u == null
                    ? tools.RandomFirstName()
                    : u.firstName
                : realName;
            if (u == null) {
                UpdateRealName({
                    userId: obj.userId,
                    firstName: obj.firstName
                });
            }
            return obj;
        }).then(function (u) {
            if (tools.JudgeCommunityToPush(communityId)) {
                Push('http://219.233.18.245:15286/door_wechat/wechat_door_open_log', obj);
                Push('http://219.233.18.245:15329/connector/wechat_door_open_log', obj);
                Push('http://219.233.18.245:17329/connector/wechat_door_open_log', obj);
                Push('http://219.233.18.245:17344/connector/wechat_door_open_log', obj);
            }

            let userInfo = {
                device_id: obj.doorId,
                user_id: obj.userId,
                user_sex: obj.userSex,
                phone_num: obj.phoneNumber,
                first_name: obj.firstName
            };

            let deviceInfo = {
                device_id: obj.doorId,
                device_name: obj.doorName,
                latitude: obj.Latitude,
                longitude: obj.Longitude,
                address: obj.address,
                district: obj.locality,
                town: obj.locality,
                communityName: obj.communityName
            }

            let openInfo = {
                device_id: obj.doorId,
                user_id: obj.userId,
                door_status: true
            }

            jingan.UploadJingAn(userInfo, deviceInfo, openInfo, communityId)
        })
    })
}



/**
 * 处理用户姓名
 * @param {String} realName 真实姓名
 * @param {String} dynamic 动态字段 JSON格式
 */
function HandleDynamic(realName, dynamic) {
    if (realName != null && realName != '') {
        realName = realName.substring(0, 1);
    } else {
        try {
            let jsonData = JSON.parse(dynamic);
            jsonData.forEach(function (element) {
                if (element.name == '姓名') {
                    realName = element.value.substring(0, 1);
                }
            }, this);
        } catch (error) {
            realName = null;
        }
    }
    return realName;
}



/**
 * 更新开门数据
 * @param {OBJ} obj 数据
 */
function UpdateRealName(obj) {
    firstNameOfUserModel.update({ userId: obj.userId }, { $set: obj }, { upsert: true }, function () { });
}



/**
 * 判断是否存在用户的姓氏记录 
 * @param {OBJ} obj 用户id
 */
function JudgeFirstName(obj) {
    let data = firstNameOfUserModel.findOne({ userId: obj.userId }).select('firstName').exec();
    return data;
}


/**
 * 推动到东方明珠接口
 * @param {OBJ} obj 
 */
function Push(url, obj) {
    try {
        var options = {
            headers: { "content-type": "application/json" },
            url: url,
            method: 'POST',
            json: true,
            body: obj
        };
        function callback(error, response, data) {
            //console.log('dongfang:'+url+'----'+JSON.stringify(options)+JSON.stringify(error) + JSON.stringify(response));
            if (!error && response.statusCode == 200) {
                //console.log('dongfang:'+url+'----'+ JSON.stringify(response));
            }
        }
        request(options, callback);
    } catch (error) {
        //console.error(error);
    }
}

module.exports.GetCommunityInfo = GetCommunityInfo;

module.exports.JudgeFirstName = JudgeFirstName;
module.exports.UpdateRealName = UpdateRealName;
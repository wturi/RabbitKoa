const request = require('request');
const notime = require('notime');
const promise = require("bluebird");
const base64Img = require('base64-img');

const db = require('../dlls/mongo');
const mssql = require('../dlls/sqldb');
const userFaceMQ = require('../dlls/userFaceMQ')

let dataFormat = {
    /**用户id */
    userId: { type: String },
    /**第三方凭证 */
    thirdCode: { type: String },
    /**手机号 */
    phoneNumber: { type: String },
    /**头像图片 */
    imageUrlPath: { type: String },
    /**创建时间 */
    createDate: { type: Number }

};

/**
 * 用户头像最新数据
 */
let userFaceSchema = new db.mongoose.mongoose.Schema(dataFormat);


/**
 * 用户头像历史数据
 */
let userFaceLogSchema = new db.mongoose.mongoose.Schema(dataFormat)

let userFaceModel = db.mongoose.db.model('userFace', userFaceSchema);
let userFaceLogModel = db.mongoose.db.model('userFaceLog', userFaceLogSchema);



/**
 * 根据第三方凭证查询用户数据
 * @param {String} thirdCode 第三方凭证
 */
function JudgeHaveByCode(thirdCode) {
    let data = userFaceModel.findOne({ thirdCode: thirdCode }).select('phoneNumber imageUrlPath').exec();
    return data;
}


/**
 * 根据手机号判断是否存在用户
 * @param {String} phoneNumber 手机号
 */
function JudgeHaveByPhoneNumber(phoneNumber) {
    let data = userFaceModel.findOne({ phoneNumber: phoneNumber }).select('imageUrlPath').exec();
    return data;
}



/**
 * 根据第三方凭证更新手机号
 * @param {String} thirdCode 第三方认证
 * @param {String} phoneNumber 手机号
 */
function UpdatePhoneNumber(thirdCode, phoneNumber) {

    let img = userFaceModel.findOne({ phoneNumber: phoneNumber }).select('imageUrlPath').exec();
    let d = img.then(function (u) {

        let imgUrl = null;
        if (u != null) imgUrl = u.imageUrlPath;

        userFaceModel.update(
            { thirdCode: thirdCode },
            {
                $set: {
                    phoneNumber: phoneNumber,
                    imageUrlPath: imgUrl
                }
            }, { upsert: true }, function () { });
    })
    d.then(function (u) {
        let dd = userFaceLogModel.find({ thirdCode: thirdCode }).select('phoneNumber imageUrlPath').exec();
        return dd;
    })
    return d;

}


/**
 * 根据手机号更新用户头像最新数据(只更新图片地址)
 * @param {String} phoneNumber 手机号
 * @param {String} imageUrlPath 图片地址
 */
function UpdateUserFaceByPhonenumber(thirdCode, imageUrlPath) {
    let obj = {
        imageUrlPath: imageUrlPath,
        createDate: notime.getnowts().strts
    };
    userFaceModel.update({ thirdCode: thirdCode }, {
        $set: {
            imageUrlPath: obj.imageUrlPath

        }
    }, { upsert: true }, function () { });
    AddUserFaceLog(obj);
    GetDoorId(thirdCode, obj.imageUrlPath);
}



/**
 * 根据用户id判断是否存在用户
 * @param {String} userId 用户id
 */
function JudgeHave(userId) {
    let data = userFaceModel.findOne({ userId: userId }).select('imageUrlPath').exec();
    return data;
}




/**
 * 更新用户头像最新数据
 * @param {String} userId 用户头像
 * @param {String} imageUrlPath 头像网络地址
 */
function UpdateUserFace(userId, imageUrlPath) {
    let obj = {
        userId: userId,
        imageUrlPath: imageUrlPath,
        createDate: notime.getnowts().strts
    };
    userFaceModel.update({ userId: obj.userId }, { $set: obj }, { upsert: true }, function () { });
    AddUserFaceLog(obj);

}



/**
 * 新增用户头像历史数据
 * @param {Object} obj 数据对象
 */
function AddUserFaceLog(obj) {
    let data = new userFaceLogModel(obj);
    data.save();
}


/**
 * 根据第三方凭证获取门权限并添加到门口机消息中
 * @param {String} userId 第三方凭证
 * @param {String} imageUrlPath 图片地址
 */
function GetDoorId(userId, imageUrlPath) {

    //获取手机号
    let thirdData = JudgeHaveByCode(userId).then(GetUserId);
    thirdData.then(function (u) {
        if (u == 0) {
            return;
        }
        let options = {
            url: 'https://www.airtu.me/AllWeb/APIS/CommunityUser/PermissionDoor/GetDoorList/' + u,
            method: "GET",
            json: true
        };
        request(options, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                data.Data.forEach(element => {
                    let commId = element.communityId;
                    let doorIds = element.doorIds;
                    userFaceMQ.Add(u, imageUrlPath, commId, doorIds)
                });
            }
        })

    })
}


/**
 * 推送图片下发状态到用户 通过模板消息
 * @param {String} userId 用户id
 * @param {Boolean} isBool 是否下发成功
 */
function PushStates(userId, isBool,doorName,commName) {
    let sqlstr = 'select OpenId from WechatUsers where CommunityUserId=' + userId;
    mssql.sql(sqlstr, function (err, result) {
        if (err) {
            console.error(err);
        }
        let wUsers = result.recordset[0];
        let option = {
            OpenId: wUsers.OpenId,
            Content: {
                first: {
                    value: '尊敬的用户：您的认证申请已经处理完成。'
                },
                keyword1: {
                    value: '刷脸开门认证'
                },
                keyword2: {
                    value: notime.strtstotext(notime.getnowts().strts)
                },
                keyword3: {
                    value:` ${commName=='undefined'?'':commName} ${doorName=='undefined'?'':doorName} ${isBool=='true'?'通过':'未通过'}`,
                    color:isBool=='true'? '#00EE00':'#ff0024'
                },
                remark: {
                    value:`${isBool=='true'?'谢谢使用。':'请重新上传照片。'}`
                }
            },
            Url: ''
        }
        let uri = {
            url: 'https://www.airtu.me/AllWeb/APIS/WeChat/Template/PushTextNoUrl?id='+1,
            method: "POST",
            json: true,
            body:option
        };

        console.log(uri);
        request(uri,  function (error, response, data) {
            if(error)console.log(error);
            console.log(data)
        })
    })
}


/**
 * 根据手机号获取userid
 * @param {String} pr 传递参数
 */
let GetUserId = function (pr) {
    let phoneNumber = pr.phoneNumber;
    return new promise(function (resolve, reject) {
        let sql = "select CommunityUserId from CommunityUsers where phonenumber='" + phoneNumber + "'";
        mssql.sql(sql, (err, result) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            let da = result.recordset[0];
            if (da != null && da.CommunityUserId != null) {
                resolve(da.CommunityUserId);
            }
            else {
                resolve(0)
            }
        })
    })
}


module.exports.JudgeHaveByCode = JudgeHaveByCode;
module.exports.UpdatePhoneNumber = UpdatePhoneNumber;
module.exports.UpdateUserFaceByPhonenumber = UpdateUserFaceByPhonenumber;
module.exports.Update = UpdateUserFace;
module.exports.JudgeHave = JudgeHave;
module.exports.JudgeHaveByPhoneNumber = JudgeHaveByPhoneNumber;
module.exports.PushStates = PushStates;
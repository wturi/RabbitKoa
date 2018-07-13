const request = require('request');
const utils = require('utility');
const requestPr = require('request-promise')


const mssql = require('../dlls/sqldb');
const tools = require('../dlls/tools');
const db = require('../dlls/mongo');
const userFace = require('../dlls/userFace');

let HaveUser = [];

let kafkaPeopleSchema = new db.mongoose.mongoose.Schema({
    userId: { type: String },
    userIdMD5: { type: String },
    updateNumber: { type: Number },
    updateDate: { type: Number },
    peopleName: { type: String },
    villageCode: { type: String },
    communityId: { type: String },
    phoneNo: { type: String },
    residenceDetailAddress: { type: String }
})

let kafkaPeopleModel = db.mongoose.db.model('kafkaPeople', kafkaPeopleSchema)

/**
 * 开门记录
 * @param {Number} doorOpenLog 开门记录id
 */
function UploadDoorOpenLog(doorOpenLog) {

    let sqlstr = 'select * from (select \
        dol.DoorOpenLogId as recordId, \
        m.InnerNumber as deviceId, \
        dol.CreatedDate as openTime,  \
        dol.OpenWith as openType,  \
        d.CommunityId as communityId, \
        d.Name as buildingNO , \
        dol.CommunityUserId as communityUserId, \
        c.Name as commName, \
        d.doorGroupName as doorGroupName \
        from DoorOpenLogs as dol,  \
        Machines as m,(select  \
        ds.*,dg.Name as doorGroupName  \
        from Doors ds left join  \
        DoorGroups dg on ds.DoorGroupId=dg.Id) as d, \
        CommunityEntities as c \
        where dol.MachineId=m.MachineId \
        and d.CommunityId=c.CommunityId   \
        and m.DoorId=d.DoorId  \
        and dol.DoorOpenLogId='+ doorOpenLog + ') as kafkaopenlog left join \
        (select  \
        oldac.DynamicFieId as dynamicContent, \
        cUser.PhoneNumber as phone, \
        oldac.CommunityUserId as cUserId, \
        oldac.CommunityId as communityId, \
        oldac.Content as myFloorName \
        from  (select newactivated.*,fff.Content from ActivatedLogs newactivated,Floors fff where newactivated.FloorId=fff.id) as oldac left join    \
        CommunityUsers cUser  \
        on  oldac.CommunityUserId=cuser.communityuserid) as ac \
        on(kafkaopenlog.communityUserId=ac.cUserId  \
        and kafkaopenlog.communityId=ac.CommunityId )';
    mssql.sql(sqlstr, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        let data = result.recordset[0];
        if (tools.JudgeCommunityToPushOfKafka(data.communityId[0])) {
            let userId = "" + data.communityId[0] + data.cUserId;
            let doorName = data.buildingNO.split('|')[0];
            if (data.dynamicContent == null || data.dynamicContent.length == 0) return false;
            let peopleName;
            let fangjian;
            let credentialType = -1;
            try {
                let dynamicontext = JSON.parse(data.dynamicContent);
             
                if (data.doorGroupName != null) {
                    doorName = data.doorGroupName.split('|')[0] + doorName;
                }
    
                dynamicontext.forEach(element => {
                    if (element.name == "姓名") {
                        peopleName = element.value;
                    } else if (element.name == '房间号') {
                        fangjian = element.value;
                    } else if (element.name == '身份证') {
                        userId = element.value;
                        credentialType = 10;
                    }
                });
    
            } catch (error) {
                console.error(error);
            }

            let obj = {
                villageCode: tools.HandlevillageCode(data.communityId[0]),
                communityId: data.communityId[0],
                userId: userId,
                userIdMD5: utils.md5(userId),
                phoneNo: data.phone,
                residenceDetailAddress: data.commName + data.myFloorName + fangjian,
                peopleName: peopleName
            }


            console.log('kafka:开门记录-' + doorOpenLog);
            //开门纪录
            let openLogOptions = {
                url: 'https://www.airtu.me/AllWeb/APIS/Kafka/Ac/OpenLog',
                method: 'GET',
                qs: {
                    villageCode: tools.HandlevillageCode(data.communityId[0]),
                    recordId: doorOpenLog,
                    deviceId: data.deviceId,
                    cardNo: '',
                    buildingNo: doorName,
                    credentialType: credentialType,
                    credentialNo: credentialType == -1 ? obj.userIdMD5 : obj.userId,
                    openTime: data.openTime,
                    openType: '100901',
                    imgUrl: '',
                    videoUrl: ''
                }
            };

            request(openLogOptions);

            JudgeHave(obj.userId).then(function (u) {

                //推送到人员
                if (u == null) {
                    UpdateKafkaPeople(obj);
                    let peopleOptions = {
                        url: 'https://www.airtu.me/AllWeb/APIS/Kafka/People/Upload',
                        method: 'GET',
                        qs: {
                            villageCode: obj.villageCode,
                            credentialNo: obj.userId,
                            credentialType: credentialType,
                            credentialTypeCN: credentialType == 10 ? '身份证' : '逻辑证件代码',
                            phoneNo: obj.phoneNo,
                            peopleName: obj.peopleName,
                            residenceDetailAddress: obj.residenceDetailAddress
                        }
                    }
                    request(peopleOptions);
                }
            })
        }
    })
    return 200;
}


/**
 * 上传开门人脸头像到kafka
 * @param {String} villageCode 社区id
 * @param {Number} recordId 开门纪录id
 * @param {Number} cUserId 用户id
 */
module.exports.UploadDoorImg = function (villageCode, recordId, cUserId) {
    return userFace.JudgeHaveByCode(cUserId)
        .then(function (u1) {
            if (u1 != null && u1.imageUrlPath != null) {
                villageCode = tools.HandlevillageCode(villageCode);
                if (villageCode == 0) return false;
                let obj = {
                    villageCode: villageCode,
                    recordId: recordId,
                    imgUrl: u1.imageUrlPath
                }

                if(obj.imgUrl==null){
                    return false;
                }

                console.log(obj.imgUrl);
                let pr= Push('https://www.airtu.me/AllWeb/APIS/Kafka/Ac/OpenLogImg', obj, 'POST')
                  pr.then(function(ee){

                      console.log('openlogImg:mes:'+ ee);
                  })
                return pr;
            }
        })
}


/**
 * 判断是否存在用户
 * @param {String} userId 用户id
 */
function JudgeHave(userId) {
    let data = kafkaPeopleModel.findOne({ userId: userId }).select('userIdMD5').exec();
    return data;
}

/**
 * 更新数据
 * @param {Object} obj 数据对象
 */
function UpdateKafkaPeople(obj) {
    kafkaPeopleModel.update({ userId: obj.userId }, { $set: obj }, { upsert: true }, function () { });
}



/**
 * 推送接口
 * @param {OBJ} obj 
 */
function Push(url, obj, method) {
    var options = {
        headers: {
            "content-type": "application/json"
        },
        url: url,
        method: method,
        json: true,
        body: obj,
    };
    return requestPr(options);
}

module.exports.UploadDoorOpenLog = UploadDoorOpenLog;

const db = require('../dlls/mongo');
const notime = require('notime');
const sql = require('../dlls/sqldb')
const tools = require('../dlls/tools');
const dongfang = require('../dlls/dongfang');
const request = require('request-promise');
const https = require('https')


let openDoorLogSchema = new db.mongoose.mongoose.Schema({
    _id: { type: Number, default: notime.getnowts().strts },
    communityUserId: { type: Number },
    createDate: { type: Number },
    openDate: { type: Number },
    openModeText: { type: String },
    isSuccessed: { type: String },
    innerNumber: { type: String },
    remarks: { type: String },
    doorId: { type: Number }
})

let openDoorModel = db.mongoose.db.model('openDoorLog', openDoorLogSchema);

module.exports.Get = {
    All: function () {
        GetDoorLog();
    }
}

module.exports.Insert = {
    One: function (obj) {
        InsertDoorLogOne(obj);
    }
}

module.exports.Open = {
    OpenOfNoLocation: function (userId, doorId, openWith) {
        Open(userId, doorId, openWith);
        
    }
}



/**
 * 根据用户id及门id直接开门
 * @param {Number} userId 用户id
 * @param {Number} doorId 门id
 * @param {Number} openWith 开门方式
 */
function Open(userId, doorId, openWith) {
    let data = {
        id: userId,
        doorId: doorId,
        openWith: openWith
    }
    let url = 'https://www.airtu.me/AllWeb/APIS/Doors/OpenDoor/Open/' + data.id + '?doorId=' + data.doorId + '&openWith=' + data.openWith;

    https.get(url, function (result) {
        //console.log(result);
    })

}



/**
 * 从主数据库 mssql中获取所有开门记录
 */
function GetDoorLog() {
    let sqlstr = "select  \
    DATEDIFF(s, '1970-01-01 00:00:00', dl.FinisheDate) as createDate,\
    DATEDIFF(s, '1970-01-01 00:00:00', dl.FinisheDate) as  openDate, \
    m.InnerNumber as innerNumber,\
    dl.CommunityUserId as communityUserId,\
    m.DoorId as doorId,\
    dl.IsSuccessed as isSuccessed,\
    case when dl.OpenWith=1 then 'Wechat' else 'Unknown' end as openModeText,\
    dl.Remarks as remarks \
    from DoorOpenLogs dl \
    left join Machines m  \
    on dl.MachineId=m.MachineId \
    ORDER BY dl.DoorOpenLogId desc";
    sql.sql(sqlstr, function (err, result) {
        if (err) {
            return;
        }
        let data = result.recordset;
        InsertDoorLog(data);
    })
}



/**
 * 循环处理开门数据并插入到mongo数据库中
 * @param {obj} obj 从主数据库获取的开门记录数据
 */
function InsertDoorLog(obj) {
    openDoorModel.collection.insert(obj, function (err) {
        if (err) {
            //console.log(err);
        }
    })
}


/**
 * 添加一条开门记录
 * @param {obj} obj 开门记录
 */
function InsertDoorLogOne(obj) {
    let data = new openDoorModel({
        _id: notime.getnowts().strts,
        communityUserId: obj.CommunityUserId,
        createDate: notime.convts(obj.CreatedDate).strts,
        openDate: notime.convts(obj.FinisheDate).strts,
        openModeText: ConversionOpenWith(Number(obj.OpenWith)),
        isSuccessed: obj.IsSuccessed,
        innerNumber: obj.InnerNumber,
        doorId: obj.DoorId,
        remarks: obj.Remarks
    })
    let isbool = tools.JudgeData(data.communityUserId, data.createDate, data.openDate, data.openModeText, data.isSuccessed, data.innerNumber, data.doorId);
    if (!isbool) return 400;
    data.save();
    dongfang.GetCommunityInfo(data.doorId, {
        doorId: '',
        doorName: '',
        communityName: '',
        phoneNumber: '',
        firstName: "",
        openDoorDate: data.createDate,
        isSuccess: data.isSuccessed,
        userId: data.communityUserId,
        userSex: 0
    });

    return 200;
}


/**
 * 转换开门方式
 * @param {int} openWith 开门方式
 */
function ConversionOpenWith(openWith) {
    switch (openWith) {
        case 1: return 'Wechat'; break;
        case 2: return 'Face'; break;
        case 3: return 'Card'; break;
        case 4: return 'Phone'; break;
        default: return 'Unknown'; break;
    }
}




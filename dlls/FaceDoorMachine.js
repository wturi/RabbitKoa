const request = require('request');
const notime = require('notime');

const db = require('../dlls/mongo');

/**
 * 设备信息数据结构
 */
let dataFormat = {
    /**设备唯一标识码 */
    deviceKey: { type: String },
    /**设备当前时间戳 */
    time: { type: String },
    /**设备当前ip地址 */
    ip: { type: String },
    /**设备当前注册人员数量 */
    personCount: { type: String },
    /**设备当前注册的照片数量 */
    faceCount: { type: String },
    /**设备版本号 */
    version: { type: String },
    /**设备是否在线 */
    isOnline: { type: Boolean, default: true },
    /**设备绑定门id */
    doorId: { type: Number },
    /**设备绑定门名称 */
    doorName: { type: String },
    /**设备所属社区 */
    commId: { type: Number },
    /**设备所属社区名称 */
    commName: { type: String }
};

/**最新设备信息 */
let faceDoorMachineSchema = new db.mongoose.mongoose.Schema(dataFormat)


/**历史设备心跳纪录 */
let faceDoorMachineLogSchema = new db.mongoose.mongoose.Schema(dataFormat)


/**回调日志 */
let setIdentifyCallBackSchema = new db.mongoose.mongoose.Schema({
    ip: { type: String },
    personId: { type: String },
    time: { type: String },
    deviceKey: { type: String },
    type: { type: String },
    createData: { type: Number },
    path: { type: String }
});


let faceDoorMachineModel = db.mongoose.db.model('faceDoorMachine', faceDoorMachineSchema);
let faceDoorMachineLogModel = db.mongoose.db.model('faceDoorMachineLog', faceDoorMachineLogSchema);

let setIdentifyCallBackModel = db.mongoose.db.model('setIdentifyCallBack', setIdentifyCallBackSchema)




/**
 * 更新设备信息
 * @param {Object} obj 数据对象
 */
function Update(obj) {
    let data = faceDoorMachineModel.update({ deviceKey: obj.deviceKey }, {
        $set: {
            time: obj.time,
            ip: obj.ip,
            personCount: obj.personCount,
            faceCount: obj.faceCount,
            version: obj.version,
            isOnline: true
        }
    }, { upsert: true }, function () { });
    let logData = new faceDoorMachineLogModel(obj);
    logData.save();

};

/**
 * 更新社区所有设备在线状态
 * @param {string} deviceKey 设备id
 */
function UpdateIsOnline(commId, isOnline) {
    let data = faceDoorMachineModel.update({ commId: commId }, {
        $set: {
            isOnline: isOnline
        }
    }, { upsert: true }, function () { });
}



/**
 * 设备关联社区及门
 * @param {String} deviceKey 设备序列号
 * @param {Number} commId 社区id
 * @param {Number} doorId 门id
 */
function UpdateCommIdAndDoorId(deviceKey, commId, doorId,doorName,commName) {
    let data = faceDoorMachineModel.update({ deviceKey: deviceKey }, {
        $set: {
            commId: commId,
            doorId: doorId,
            commName:commName,
            doorName:doorName
        }
    }, { upsert: true }, function () { });
}

/**
 * 获取设备信息
 * @param {Number} commId 社区id
 */
function Get(commId) {
    let data = faceDoorMachineModel.find({ isOnline: true, commId: commId }).select('ip doorId doorName commName').exec();
    return data;
}


/**
 * 根据设备序列号查询门
 * @param {String} deviceKey 设备序列号
 */
function FindOne(deviceKey) {
    let data = faceDoorMachineModel.findOne({ deviceKey: deviceKey }).select('doorId').exec();
    return data;
}

function AddCallBack(obj) {
    let newObj = {
        ip: obj.ip,
        personId: obj.personId,
        time: obj.time,
        deviceKey: obj.deviceKey,
        type: obj.type,
        createData: notime.getnowts().strts,
        path: obj.path
    }
    let data = new setIdentifyCallBackModel(newObj);
    data.save();
}

module.exports.Update = Update;
module.exports.UpdateCommIdAndDoorId = UpdateCommIdAndDoorId;
module.exports.Get = Get;
module.exports.FindOne = FindOne;
module.exports.AddCallBack = AddCallBack;
module.exports.UpdateIsOnline = UpdateIsOnline;
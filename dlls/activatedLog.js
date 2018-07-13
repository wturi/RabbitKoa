const notime = require('notime');

const db = require('../dlls/mongo');

let activatedLogSchema = new db.mongoose.mongoose.Schema({
    activatedLogPrescriptionId: { type: Number },
    activatedLogId: { type: Number },
    data: [{
        name: { type: String },
        value: { type: String }
    }],
    isEnable: { type: Boolean, default: true },
    createDate: { type: Number }
});

let activatedLogModel = db.mongoose.db.model('activatedLog', activatedLogSchema);


/**
 *  添加审核记录
 * @param {Number} activatedLogId 审核表id 
 * @param {String} json 记录数据
 */
function Insert(activatedLogPrescriptionId,activatedLogId, json) {
    try {
        let data = new activatedLogModel({
            activatedLogPrescriptionId:activatedLogPrescriptionId,
            activatedLogId: activatedLogId,
            data: json,
            createDate: notime.getnowts().strts
        })
        data.save();
        return 200;
    } catch (error) {
        return 500;
        console.error(error);
    }
}




/**
 * 获取该申请的门权限历史记录
 * @param {Number} activatedlogId 审核表id
 */
function GetAllData(activatedlogId) {
    let data = activatedLogModel
        .find({ activatedLogId: activatedlogId })
        .sort({ 'createDate': -1 })
        .select('data').exec();
    return data;
}

module.exports.Insert = Insert;
module.exports.Find = {
    ALl: GetAllData
}
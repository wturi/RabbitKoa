const db = require('../dlls/mongo');
const notime = require('notime');
const mssql = require('../dlls/sqldb');
const faceDoorMachine=require('../dlls/FaceDoorMachine');

let dataFormat = {
    _id: { type: Number },
    userId: { type: Number },
    createDate: { type: Number },
    commId: { type: Number },
    doorIds: { type: Object },
    isRead: { type: Boolean },
    imageUrlPath: { type: String },
    name: { type: String }
}


let userFaceMQSchema = new db.mongoose.mongoose.Schema(dataFormat);
let userFaceMQModel = db.mongoose.db.model('userFaceMQ', userFaceMQSchema);


/**
 * 添加一条需要下发到人脸门口机处理的消息，分社区
 * @param {Number} userId 用户id
 * @param {String} imageUrlPath 自拍照地址
 * @param {Number} commId 社区id
 * @param {Object} doorIds 门id数组
 */
function Add(userId, imageUrlPath, commId, doorIds) {
    let sql = 'select DynamicFieId from ActivatedLogs where CommunityUserId=' + userId + ' and CommunityId=' + commId + ' and IsActivated=1';
    mssql.sql(sql, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        let da = result.recordset[0];
        let peopleName;
        if (da != null && da.DynamicFieId != null) {
            da.DynamicFieId = da.DynamicFieId.replace(/'/g, '"');
            let dynamicontext = JSON.parse(da.DynamicFieId);
            if (dynamicontext == null || dynamicontext.length == 0) peopleName = '业主';
            dynamicontext.forEach(element => {
                if (element.name == "姓名") {
                    peopleName = element.value;
                }
            });
        } else {
            peopleName = '业主';
        }


        let obj = {
            _id: notime.getnowts().strts,
            userId: userId,
            createDate: notime.getnowts().strts,
            commId: commId,
            doorIds: doorIds,
            isRead: false,
            imageUrlPath: imageUrlPath,
            name: peopleName
        }
        let data = new userFaceMQModel(obj);
        data.save();
    })
}



/**
 * 根据社区拉取未被处理的id
 * @param {Number} commId 社区id
 */
function Get(commId) {
    faceDoorMachine.UpdateIsOnline(commId,false);
    let data = userFaceMQModel.find(
        {
            commId: commId,
            isRead: false
        }).sort({ 'createDate': 1 })
        .select('userId imageUrlPath doorIds name').exec();
    return data;

}


/**
 * 修改消息状态
 * @param {Object} _id 自动生成id
 */
function Update(_id) {
    userFaceMQModel.update(
        {
            _id: _id
        }, {
            $set: {
                isRead: true
            }
        }, { upsert: true }, function () { });
}



module.exports.Add = Add;

module.exports.Get = Get;
module.exports.Update = Update;
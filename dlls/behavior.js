const db = require('../dlls/mongo');
const tools = require('../dlls/tools');


let behaviorSchema = new db.mongoose.mongoose.Schema({
    cUserId: { type: Number },
    createDate: { type: Date, default: Date.now },
    name: { type: String },
    content: { type: String },
    remarks: { type: String }
});

let behaviorModel = db.mongoose.db.model('behavior', behaviorSchema);

/**
 * 添加用户行为
 * @param {*} obj 
 */
function Insert(obj) {
    let isbool = tools.JudgeData(obj.cUserId, obj.name, obj.content);
    if (!isbool) return 400;
    let oneData = new behaviorModel({
        cUserId: obj.cUserId,
        name: obj.name,
        content: obj.content,
        remarks: obj.remarks
    });

    oneData.save(function (err) {
        if (err)
            console.error(err);
    });
}


module.exports.Insert = Insert;
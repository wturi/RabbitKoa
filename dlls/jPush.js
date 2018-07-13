const notime = require('notime');
const JPush=require('jpush-sdk');

const mongo = require('../dlls/mongo');
const tool = require('../dlls/tools');

const client = JPush.buildClient('150eabe004cfc1477a271912', '4284e8ab5d5a01b974a9b635');

/**
 * 结构
 */
let messageSchema = new mongo.mongoose.mongoose.Schema({
    title: { type: String },
    content: { type: String },
    time: { type: Number },
    isRead: { type: Number, default: 0 },
    type: { type: String, default: 'ALL' }
});

let messageModel = mongo.mongoose.db.model('messages', messageSchema);



/**
 * 推送消息-所有人
 * @param {String} title 消息标题
 * @param {String} content 消息内容
 */
function SendALL(title,content) {
    client.push().setPlatform(JPush.ALL)
        .setAudience(JPush.ALL)
        .setNotification(title, JPush.ios(title), JPush.android(title))
        .setMessage(content)
        .send(function(err, res) {
            if (err) {
                console.error(err.message);
            } else {
                console.error('Sencho:' + res.sendno+';'+'Msg_id', +res.msg_id);
            }
        });
}


/**
 * 推送消息-指定用户
 * @param {String} alias 极光用户的绑定标记
 * @param {String} title 消息标题
 * @param {String} content 消息内容
 */
function SendAlias(alias, title,content) {
    client.push().setPlatform(JPush.ALL)
        .setAudience(JPush.registration_id(alias))
        .setNotification(title, JPush.ios(title), JPush.android(title))
        .setMessage(content)
        .send(function(err, res) {
            if (err) {
                console.error(err.message);
            } else {
                console.error('Sencho:' + res.sendno+';'+'Msg_id', +res.msg_id);
            }
        });
}
module.exports.Push={
    One:SendAlias,
    All:SendALL
}
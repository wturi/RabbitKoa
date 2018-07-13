const notime = require('notime');
const db = require('../dlls/mongo');

let communityRuleSchema = new db.mongoose.mongoose.Schema({
    _id: { type: Number, default: notime.getnowts().strts },
    title: { type: String },
    content: [],
});

let model = db.mongoose.db.model('communityRule', communityRuleSchema);



module.exports.openation = {

    /**
     * 添加数据
     * @param {obj} obj 数据
     */
    insert: function (obj) {

        let demodata = [{
            order: 0,
            type: '鸡汤',
            rule: 'Random',
            content: '',
            isUp: true
        }, {
            order: 1,
            type: '头条',
            rule: 'Recent',
            content: '',
            isUp: true
        }, {
            order: 2,
            type: '早报',
            rule: 'Random',
            content: '',
            isUp: true
        }, {
            order: 3,
            type: '安全',
            rule: 'Recent',
            content: '',
            isUp: true
        }, {
            order: 4,
            type: '生活',
            rule: 'Random',
            content: '',
            isUp: true
        }, {
            order: 5,
            type: '活动',
            rule: 'Designation',
            content: 'http://www.baidu.com',
            isUp: true
        }, {
            order: 6,
            type: '邀请家人',
            rule: 'Random',
            content: '',
            isUp: true
        }]

        let data = new model();
        data.title = 'demo';
        data.content = demodata;
        data.save();
    },


    /**
     * 根据id获取规则
     * @param {Number} _id 时间戳格式id
     */
    find: function (_id) {
        let data = model.findOne({ _id: _id }).exec();
        return data;
    }
}



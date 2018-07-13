const notime = require('notime');
const db = require('../dlls/mongo');



let materialSchema = new db.mongoose.mongoose.Schema({
    _id: { type: String, default: notime.getnowts().strts },
    title: { type: String },
    author: { type: String },
    digest: { type: String },
    content: { type: String },
    content_source_url: { type: String },
    thumb_media_id: { type: String },
    show_cover_pic: { type: Number },
    url: { type: String },
    thumb_url: { type: String },
    need_open_comment: { type: Number },
    only_fans_can_comment: { type: Number },
    create_time: { type: Number },
    storyType: { type: String, default: "默认" },
    isShow: { type: Boolean, default: true }
});

var monModel = db.mongoose.db.model('Material', materialSchema);

///保存
function ObjToMongo(obj) {
    obj.news_item.forEach(function(element) {
        let oldData =element;
        //console.log(oldData.title);
        let data = new monModel({
            _id: notime.getnowts().strts,
            title: oldData.title,
            author: oldData.author,
            digest: oldData.digest,
            content: oldData.content,
            content_source_url: oldData.content_source_url,
            thumb_media_id: oldData.thumb_media_id,
            show_cover_pic: oldData.show_cover_pic,
            url: oldData.url,
            thumb_url: oldData.thumb_url,
            need_open_comment: oldData.need_open_comment,
            only_fans_can_comment: oldData.only_fans_can_comment,
            create_time: obj.create_time
        });
        monModel.findOne({ thumb_media_id: data.thumb_media_id }, function (err, doc) {
            if (err) {
                console.error(err)
            } else {
                if (doc == null) {
                    data.save(function (err) {
                        if (err) {
                            console.error(err)
                        }
                    })
                } else {
                    let _id = doc._id;
                    delete doc._id;
                    monModel.update({ _id: _id }, doc, function (err) {
                        if (err)
                            console.error(err)
                    })
                }
            }
        })
    }, this);
};

module.exports.find = {
    Random: function (type) {
        let data = monModel.find({ storyType: type }).select('title url isShow').exec();
        return data;
    },
    Recent: function (type) {
        let data = monModel.findOne({ storyType: type }).sort({ 'create_time': -1 }).select('title url isShow').exec();
        return data;
    },
    All: function () {
        let data = monModel.find().sort({ 'create_time': -1 }).select('title url storyType isShow').exec();
        return data;
    },
    Title: function (title) {
        let data = monModel.find({ title: title }).select('url isShow').exec();
        return data;
    },
    TitleVague: function (title) {
        let query = new RegExp(title);
        let data = monModel.find({ title: query }).select('title url storyType isShow').exec();
        return data;
    }
}


module.exports.update = {
    /**
     * 修改类型
     */
    storyType: function (_id, type) {
        let condotions = { _id: _id };
        let update = { $set: { storyType: type } };
        monModel.update(condotions, update, function (err) {
            if (err) {
               return false;
            } else {
               return true;
            }
        });
    },
    /**
     * 修改是否显示
     */
    isShow: function (_id, isshow) {
        let condotions = { _id: _id };
        let update = { $set: { isShow: isshow } };
        monModel.update(condotions, update, function (err) {
            if (err) {
                return false;
            } else {
                return true;
            }
        })
    }
}


module.exports.insert={
    /**
     * 添加文章
     */
    material:function(title,storyType,url){
        var oldData= monModel.findOne({title:title}).exec(function(err,doc){
            if(doc==null){
                let data=new monModel({
                    _id:notime.getnowts().strts,
                    title:title,
                    url:url,
                    storyType:storyType
                })
                data.save();
                return true;
            }else{
                return false;
            }
        });
        return oldData;
    }
}

module.exports.ObjToMongo = ObjToMongo;
module.exports.monModel = monModel;
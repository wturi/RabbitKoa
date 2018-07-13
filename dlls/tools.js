

//判断参数是否全
function JudgeData(...x) {
    let isbool = true;
    x.forEach(function (item, index) {
        if (item == '' || item == null) {
            isbool = false;
        }
    })
    return isbool;
}

const pushCommunity = [5269, 9539, 7851, 7319, 7875, 20887, 20888, 20889, 20890, 440, 3, 20914, 20910]
const firstNames = ["王", "张", "刘", "陈", "杨", "黄", "赵", "周", "吴", "徐", "孙", "朱", "马", "胡", "郭", "林", "何", "高", "梁", "郑", "罗", "宋", "谢", "唐", "韩", "曹", "许", "邓", "萧", "冯", "曾", "程", "蔡", "彭", "潘", "袁", "于", "董", "余", "苏", "叶", "吕", "魏", "蒋", "田", "杜", "丁", "沈", "姜", "范", "江", "傅", "钟", "卢", "汪", "戴", "崔", "任", "陆", "廖", "姚", "方", "金", "邱", "夏", "谭", "韦", "贾", "邹", "石", "熊", "孟", "秦", "阎", "薛", "侯", "雷", "白", "龙", "段", "郝", "孔", "邵", "史", "毛", "常", "万", "顾", "赖", "武", "康", "贺", "严", "尹", "钱", "施", "牛", "洪", "龚", "汤", "陶", "黎", "温", "莫", "易", "樊", "乔", "文", "安", "殷", "颜", "庄", "章", "鲁", "倪", "庞", "邢", "俞", "翟", "蓝", "聂", "齐", "向", "申", "葛", "岳"];

const kafkaPushCommunity = [4518, 20874]

/**
 * 判断该社区的数据是否需要推送(东方明珠)
 * @param {Number} communityId 社区id
 */
function JudgeCommunityToPush(communityId) {
    let isbool = false;;
    pushCommunity.forEach(function (element) {
        if (communityId == element) {
            isbool = true;
        }
    }, this);
    return isbool;
}


/**
 * 判断该社区的数据是否需要推送(kafka)
 * @param {Number} communityId 社区id
 */
function JudgeCommunityToPushOfKafka(communityId) {
    let isbool = false;;
    kafkaPushCommunity.forEach(function (element) {
        if (communityId == element) {
            isbool = true;
        }
    }, this);
    return isbool;
}

/**
 * 处理社区编号（kafka）
 * @param {Number} communityId 社区id
 */
function HandlevillageCode(communityId) {
    switch (communityId) {
        case "4518":
            return '310101015002';
        case "20874":
            return '310101015001';
        case 4518:
            return '310101015002';
        case 20874:
            return '310101015001';
        default:
            return 0;
    }
}



/**
 * 随机获取姓氏
 */
function RandomFirstName() {
    let newFirstNames = firstNames.shuffle();
    return newFirstNames[0];
}



/**
 * 洗牌算法
 */
Array.prototype.shuffle = function () {
    var input = this;
    for (var i = input.length - 1; i >= 0; i--) {
        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = input[randomIndex];
        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
}


module.exports.JudgeData = JudgeData;
module.exports.JudgeCommunityToPush = JudgeCommunityToPush;
module.exports.RandomFirstName = RandomFirstName;
module.exports.JudgeCommunityToPushOfKafka = JudgeCommunityToPushOfKafka;
module.exports.HandlevillageCode = HandlevillageCode;
const spawn = require('child_process').spawn;
const iconv = require('iconv-lite');



module.exports.ys7Push = {
    /**
     * 启动萤石云警报推送接受服务
     */
    open: function () {
        free = spawn('java', ['-jar', '../jars/ystPush/PushTest.jar']);
        free.stdout.on('data', function (data) {
            let message = iconv.decode(data, 'GBK');
            let mqtt = 'MQTTFrame';
            if (message.indexOf(mqtt) < 0) {
                //console.log(message);
            }
        })
    }
}


const request = require('request-promise');

/**
 * 推送接口
 * @param {OBJ} obj 
 */
function Push(url, obj, method) {
    var options = {
        headers: {
            "content-type": "application/json"
        },
        url: url,
        method: method,
        json: true,
        body: obj,
    };
    return request(options);
}


module.exports.Push = Push;
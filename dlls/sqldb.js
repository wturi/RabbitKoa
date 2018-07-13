const mssql = require('mssql');
let db = {};
let config = {
    user: 'sa',
    password: 'anji2008',
    server: '115.159.71.54',
    database: 'RabbitMP',
    options: {
        encrypt: false // Use this if you're on Windows Azure  
    },
    pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 3000
    }
};

//执行sql,返回数据.  
db.sql = function (sql, callBack) {
    let connection = new mssql.ConnectionPool(config, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        let ps = new mssql.PreparedStatement(connection);
        ps.prepare(sql, function (err) {
            if (err) {
                console.error(err);
                return;
            }
            ps.execute('', function (err, result) {
                if (err) {
                    console.error(err);
                    return;
                }

                ps.unprepare(function (err) {
                    if (err) {
                        console.error(err);
                        callback(err, null);
                        return;
                    }
                    callBack(err, result);
                });
            });
        });
    });
};

module.exports = db;
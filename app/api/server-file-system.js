var express = require('express')
var router = express.Router();
var fs = require('fs');
var path = require('path');
var q = require('q');
var config;


// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now())
    console.log(res)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', 86400);


    //console.log(req);

    success = function (_res) {
        res.statusCode = req.method === 'POST' ? 201 : req.method === 'DELETE' ? 204 : 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(_res.data));
        res.end();
    }

    error = function (err) {
        res.statusCode = 500;

        if (typeof err == 'string') {
            res.setHeader('Content-Type', 'text/plain');
            res.write(err);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(err, ["message", "arguments", "type", "stack", "name"]));
        }

        res.end();
    }
    next();

})
// define the home page route
router.get('/:entity/:id', function (req, res) {
    getData(req.params.entity, req.params.id)
        .then(success, error);

})

router.get('/:entity', function (req, res, next) {
    getData(req.params.entity)
        .then(success, error);

})
// define the about route
router.post('/:entity', function (req, res) {
    insertData(req.params.entity, req.body)
        .then(success, error);
})

router.put('/:entity/:id', function (req, res) {
    updateData(req.params.entity, req.params.id, req.body)
        .then(success, error);
})

router.delete('/:entity/:id', function (req, res) {
    deleteData(req.params.entity, req.params.id)
        .then(success, error);
})





function getFileName(entity) {
    var _entity, _dir, _fileName;

    _entity = entity;
    _dir = config.appDataFolder.substr(1) + '/' + _entity + 's';
    _fileName = path.resolve(_dir + '/' + _entity + '.json');

    if (!fs.existsSync(_fileName)) {
        mkdir('/' + _dir);
    }

    return _fileName;

}

function mkdir(dir) {
    return dir
        .split('/')
        .reduce(function (rpath, folder) {
            rpath += folder + '/';
            var _path = path.resolve(rpath)
            if (!fs.existsSync(_path)) {
                fs.mkdirSync(_path);
            }
            return rpath;
        });
}

function checkDuplicat(data, id) {
    return data.some(function (item) {
        return id == item.id;
    })

}


function getData(entity, id) {
    var defer = q.defer();
    var _fileName = getFileName(entity);
    fs.readFile(_fileName, function (err, data) {
        var _res;
        if (err) {
            defer.resolve({
                file: _fileName,
                data: []
            });

        } else {

            if (id !== null && id !== undefined) {
                data = JSON.parse(data);
                _res = data.find(function (item) {
                    return item.id == id;
                })
                _res = _res == undefined ? defer.reject(new Error("No data found for id " + id + ".")) : _res;
            } else {
                _res = JSON.parse(data);
            }

            defer.resolve({
                file: _fileName,
                data: _res
            });
        }
    });
    return defer.promise;
}

function reorderData(data) {
    var _createdData = {};
    _createdData['id'] = data['id'];
    for (var key in data) {
        if (key != "id") _createdData[key] = data[key];
    }

    return _createdData;
}


function insertData(entity, data) {
    var defer = q.defer();
    getData(entity).then(function (_res) {
        //_data = JSON.parse(_res.data);
        _data = _res.data;
        if (Array.isArray(_data)) {

            if (!data.id) {
                data.id = new Date().getTime();
            } else {
                if (checkDuplicat(_data, data.id)) {
                    defer.reject(new Error("Id " + data.id + " already exists.Please provide some other Id."));
                };
            }
            var _newData = reorderData(data);
            _data.push(_newData);
        } else {
            defer.reject(new Error("Your json data file is corrupted."));
        }

        _data = JSON.stringify(_data);

        writeDataToFile(_res.file, _data).then(function () {
            defer.resolve({
                data: _newData
            });
        })


    }, function (err) {
        defer.reject(err);
    });

    return defer.promise;


}

//generate random number out of digits
function rand(digits) {
    return Math.floor(Math.random() * parseInt('8' + '9'.repeat(digits - 1)) + parseInt('1' + '0'.repeat(digits - 1)));
}


function updateData(entity, id, data) {

    var defer = q.defer();
    var _updatedData
    getData(entity).then(function (_res) {
        // _data = JSON.parse(_res.data);
        try {

            _data = _res.data;
            //data check
            if (Array.isArray(_data)) {
                _data.forEach(function (item, index) {
                    if (item.id == id) {
                        for (var key in data) {
                            if (key != "id") item[key] = data[key];
                        }
                        _updatedData = item;
                        // break;
                    }
                })
            } else {
                defer.reject(new Error("Your json data file is corrupted."));
            }


            // if file updated of not
            if (_updatedData) {
                _data = JSON.stringify(_data);

                writeDataToFile(_res.file, _data).then(function () {
                    defer.resolve({
                        data: _updatedData
                    });
                })
            } else {
                defer.reject(new Error("Data not found to update."));
            }

        } catch (error) {
            defer.reject(error);
        }
    }, function (err) {
        defer.reject(err);
    });

    return defer.promise;
}


function deleteData(entity, id) {
    var defer = q.defer();
    getData(entity).then(function (_res) {
        var _deletedData;
        // _data = JSON.parse(_res.data);
        _data = _res.data;
        if (Array.isArray(_data)) {
            for (var i = 0; i < _data.length; i++) {
                if (_data[i].id == id) {
                    _deletedData = _data.splice(i, 1);
                    break;
                }


            }
        } else {
            defer.reject(new Error("Your json data file is corrupted."));
        }

        _data = JSON.stringify(_data);

        writeDataToFile(_res.file, _data).then(function () {
            defer.resolve({
                data: _deletedData
            });
        })

    }, function (err) {
        defer.reject(err);
    });

    return defer.promise;

}

function writeDataToFile(file, data) {
    var defer = q.defer();
    fs.writeFile(file, data, 'utf-8', function (err) {
        if (err) {
            defer.reject(err)
        } else {
            defer.resolve(true);
        }

    });

    return defer.promise;
}




module.exports = function (con) {
    config = con;
    console.log(config)
    return router;
};

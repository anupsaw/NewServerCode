var utility = require('./common.js');
var q = require('q');


function saveEntity(req, res, next) {
    var writeOnFile, reqBody, id, entity
    reqBody = req.body; // this need to send back 
    id = req.params.id
    entity = req.params.entity;


    utility.readData(req.params.entity, req.params.id)
        .then(processData)
        .then(utility.writeData)



    function success(_res) {
        res.statusCode = 201;
        res.write(JSON.stringify(_res.data));
        next();
    }

    function processData(_res) {
        var _data = _res.data;

        if (!Array.isArray(_data)) _data = [];

        if (!reqBody.id) {
            reqBody.id = new Date().getTime();
        } else {
            if (checkDuplicat(_data, reqBody.id)) {
                return q.reject(new Error("Id " + reqBody.id + " already exists.Please provide some other Id."));
            };
        }

        _data.push(reorderData(reqBody));

        return q.resolve(_data);
    }


function readFile(){
    
}
    function saveData(data) {
        return utility.writeData(data, writeOnFile);
    }


}


function reorderData(data) {
    var _createdData = {};
    _createdData['id'] = data['id'];
    for (var key in data) {
        if (key != "id") _createdData[key] = data[key];
    }

    return _createdData;
}

function checkDuplicat(data, id) {
    return data.some(function (item) {
        return id == item.id;
    });

}



function postData(entity, data) {
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

module.exports = postData;
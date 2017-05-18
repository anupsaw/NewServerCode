var db = require('./common.js');
var q = require('q');


function saveEntity(req, res, next) {
    var writeOnFile, reqBody, id, entity
    reqBody = req.body; // this need to send back 
    id = req.params.id
    entity = req.params.entity;


    db.collection(entity)
        .save(reqBody)
        .then(success)
        .catch(next);



    function success(data) {
        res.statusCode = 201;
        res.write(JSON.stringify(data));
        next();
    }

    // function processData(_res) {
    //     var _data = _res.data;

    //     if (!Array.isArray(_data)) _data = [];

    //     if (!reqBody.id) {
    //         reqBody.id = new Date().getTime();
    //     } else {
    //         if (checkDuplicat(_data, reqBody.id)) {
    //             return q.reject(new Error("Id " + reqBody.id + " already exists.Please provide some other Id."));
    //         };
    //     }

    //     _data.push(reorderData(reqBody));

    //     return q.resolve(_data);
    // }

}


module.exports = saveEntity;
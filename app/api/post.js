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


}


module.exports = saveEntity;
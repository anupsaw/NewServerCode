var db = require('./common.js');


function getData(req, res, next) {

    var id, entity;

    id = req.params.id
    entity = req.params.entity;

    success = function (_res) {
        res.statusCode = 200;
        res.write(JSON.stringify(_res));
        next();
    }

    if (id) {
        db.collection(entity)
            .findOne({
                __id: id
            })
            .then(success)
            .catch(next);
    } else {
        db.collection(entity)
            .find()
            .then(success)
            .catch(next);
    }

}



module.exports = {
    getData: getData
};
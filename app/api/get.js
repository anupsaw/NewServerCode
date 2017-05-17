var utility = require('./common.js');


function getData(req, res, next) {
    success = function (_res) {
        res.statusCode =  200;
        res.write(JSON.stringify(_res.data));
        next();
    }


    utility
        .readData(req.params.entity, req.params.id)
        .then(success)
        .catch(next);
}



module.exports = {
    getData: getData
};
var utility = require('./common.js');


function getData(req, res, next) {
    success = function (_res) {
        //res.statusCode = req.method === 'POST' ? 201 : req.method === 'DELETE' ? 204 : 200;
        //res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(_res.data.er.er));
        next();
       // res.end();
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

    utility.readData(req.params.entity, req.params.id)
        .then(success)
        .catch(next);
}



module.exports = {
    getData: getData
};
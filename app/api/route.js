var express = require('express')
var router = express.Router();
var fs = require('fs');
var path = require('path');
var q = require('q');
var api = {
    get: requireFile('./app/api/get.js'),

}

    // post: requireFile('./app/api/post.js'),
    // put: requireFile('./app/api/put.js'),
    // delete: requireFile('./app/api/delete.js')
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

// router.route('/:entity/:id')
//     .get(api.get.getData)
//     .put(api.put)
//     .delete(api.delete);




// define the about route
router.route('/:entity')
    .get(api.get.getData)
   // .post(ap.post)


router.use(function (req, res, next){
    res.end();
})

router.use(function (err, req, res, next) {
    
    res.statusCode = err.status || 500;

    if (typeof err == 'string') {
        res.setHeader('Content-Type', 'text/plain');
        res.write(err);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(err, ["message", "arguments", "type", "name"]));
    }

    res.end();
});


module.exports = function (con) {
    config = con;
    console.log(config)
    return router;
};
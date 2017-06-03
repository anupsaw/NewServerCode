var express = require('express')
var router = express.Router();
var fs = require('fs');
var path = require('path');
var q = require('q');
var utility = require('./common.js');
var api = {
    get: requireFile('./app/api/get.js'),
    post: requireFile('./app/api/post.js'),
    put:requireFile('./app/api/put.js'),
}

// 
// put: requireFile('./app/api/put.js'),
// delete: requireFile('./app/api/delete.js')
var config;
var entity;

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', 86400);
    res.setHeader('Content-Type', 'application/json');

    next();

})

router.route('/:entity/:id')
    .get(api.get.getData)
    .put(api.put);
 //   .delete(api.delete);




// define the about route
router.route('/:entity')
    .get(api.get.getData)
    .post(api.post)


router.use(function (req, res, next) {
    res.end();
})

router.use(function (err, req, res, next) {

    res.statusCode = err.status || 500;
    var error = JSON.stringify(err, ["message", "arguments", "type","stack", "name"])
    res.write(error);
    utility.log(err, req.params.entity, req);
    res.end();
});


module.exports = function (con) {
    config = con;
    console.log(config)
    return router;
};
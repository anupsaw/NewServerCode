var express = require('express')
var router = express.Router();
var fs = require('fs');
var path = require('path');
var q = require('q');

var success;
var error;

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now())
    console.log(res)
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','*');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    res.setHeader('Access-Control-Max-Age',86400);

    
    //console.log(req);

    success = function (_res) {
        res.statusCode = req.method === 'POST' ? 201 : req.method === 'DELETE' ? 204 : 200;
        res.setHeader('Content-Type', 'x-www-form-urlencoded');
        res.write(JSON.stringify(_res.data));
        res.end();
    }

    error = function (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.write(err);
        res.end();
    }
    next();

})



module.exports = router;
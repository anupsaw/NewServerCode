var express = require('express')
var fs = require('fs');
var path = require('path');
var q = require('q');
var config = requireFile('app/config/config.js')();


var _id, _entity;

/**
 * get FileName  using entity
 */
function getFileName(entity, baseFolder) {

    var _dir, _fileName;

    try {

        _dir = baseFolder === undefined ? entity + 's' : baseFolder.substr(1) + '/' + entity + 's';
        _fileName = path.resolve(_dir + '/' + entity + '.json');

        if (!fs.existsSync(_fileName)) {
            mkdir('/' + _dir);
            writeData('{}', _fileName);
        }

        return q.resolve(_fileName);
    } catch (error) {
        return q.reject(error);
    }

}


/**
 * async file read.
 */
function readFile(_fileName) {

    var data = fs.readFileSync(_fileName)
    return q.resolve(getFormatedData(_fileName, data));

}

/**
 * aync file write
 * data : date to be written
 * entity : data to be written for the entity
 * file :  if data need to be written on specific file in that case entity must be null
 */


function writeData(data, file) {

    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    //return getFileName(entity, baseFolder).then(function (file) {
    return fs.writeFileSync(file, data, 'utf-8');
    //})

    //return fs.writeFile(file, data, 'utf-8');

}



/**
 * after read process file data.
 */
function processFile(res) {
    var _res, _id;
    try {
        _res = JSON.parse(res.data);
        _id = getId();
        if (_id !== undefined) {
            _res = getDataById(_id, data);
        }
        _res = getFormatedData(res.file, _res);
    } catch (error) {
        return q.reject(error);
    }

    return q.resolve(_res);
}

/**
 * make deep directory 
 */

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


/**
 * get data by Id from array of data
 */

function getDataById(id, data) {
    var res;
    res = data.find(function (item) {
        return item.id == id;
    });

    if (!res) res = new Error("No data found for id " + id + ".")

    return res;

}

function setId(id) {
    _id = id;
}
function setEntity(entity) {
    _entity = entity;
}

function getId() {
    return _id;
}

function getEntity() {
    return _entity;
}

/**
 * get formated data
 */

function getFormatedData(file, data) {

    return {
        file: file,
        data: data
    }

}


/**
 * read data for entity and id
 */

function readData(entity, id, baseFolder) {

    setId(id);
    setEntity(entity);

    if (!baseFolder) baseFolder = config.appDataFolder;

    return getFileName(entity, baseFolder)
        .then(readFile)
        .then(processFile)
        .catch(logError);

}

/**
 * log error on log file
 */

function logError(error, entity) {

    if (!entity) entity = getEntity();
    var err = JSON.stringify({
        entity: entity,
        error: JSON.stringify(error, ["message", "arguments", "type", "stack", "name"]),
        timeStamp: new Date()
    });
    readData('log', null, config.logErrorFolder)
        .then(function (res) {
            if (!Array.isArray(res.data)) {
                res.data = [];
            }

            res.data.push(err);

            writeData(res.data, res.file)
                .then(q.reject(error));

        })



}



/**
 * export methods
 */

module.exports = {
    readData: readData,
    writeData: writeData,
    logError: logError,
    createDeepDir: mkdir,
    setEntity: setEntity
};
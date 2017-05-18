var express = require('express')
var fs = require('fs');
var path = require('path');
var q = require('q');
var config = requireFile('app/config/config.js')();


var _id, _entity, baseFolder, collectionName, _isMatchMany;

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
 * new api from here
 */


/**
 * get file name Sync
 */


function getDocumentPathSync(entity, baseFolder) {

    var _dir, _fileName;

    baseFolder = (baseFolder === undefined) ? config.appDataFolder : baseFolder;

    try {

        _dir = baseFolder.substr(1) + '/' + entity + 's';
        _fileName = path.resolve(_dir + '/' + entity + '.json');

        if (!fs.existsSync(_fileName)) {
            mkdir('/' + _dir);
            writeData('{}', _fileName);
        }

        return _fileName;
    } catch (error) {
        throw error;
    }

}

/**
 * get file path async;
 */

function getDocumentpath(entity, baseFolder) {
    try {

        var filePath = getDocumentPathSync(entity, baseFolder);
        return q.resolve(filePath);

    } catch (error) {
        return q.reject(error);
    }

}


/**
 * async file read.
 */
function readDocument(documentName) {

    var data = fs.readFileSync(documentName, 'UTF-8')
    return q.resolve(JSON.parse(data));

}

/**
 * aync file write
 * data : date to be written
 * entity : data to be written for the entity
 * file :  if data need to be written on specific file in that case entity must be null
 */


function writeDocument(data, documentName) {

    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    //return getFileName(entity, baseFolder).then(function (file) {
    return fs.writeFileSync(documentName, data, 'utf-8');
    //})

    //return fs.writeFile(file, data, 'utf-8');

}


function matchDataSync(data, options, isMatchMany) {
    var matchedData = null,
        matchedOne = null,
        matchedMany = [];

    try {

        for (var i = 0; i < data.length; i++) {
            var isMatched = false,
                j = 0;
            for (var key in options) {
                if (j > 0 && !isMatched) break;
                isMatched = false;

                if (options[key] === data[i][key]) {
                    isMatched = true;
                }
                j++;
            }
            if (isMatched) {
                if (isMatchMany) {
                    matchedMany.push({
                        index: i,
                        data: data[i]
                    });
                } else {
                    matchedOne = [{
                        index: i,
                        data: data[i]
                    }]
                    break;
                }
            }


        }
        matchedData = isMatchMany ? matchedMany : matchedOne;

        return matchedData;
    } catch (error) {
        throw error;
    }
}

function matchData(data, options, isMatchMany) {

    try {
        var data = matchDataSync(data, isMatchMany);
        return q.resolve(data);
    } catch (error) {
        return err(error);
    }

}


function extractData(data) {
    var extractedData;
    try {
        if (Array.isArray(data)) {
            extractedData = data.map(function (item) {
                return item.data;
            })
        } else {
            extractedData = data.data;
        }
        return q.resolve(data.data);
    } catch (error) {
        return err(error);
    }

}





function rand(digits) {
    return Math.floor(Math.random() * parseInt('8' + '9'.repeat(digits - 1)) + parseInt('1' + '0'.repeat(digits - 1)));
}


function patchDataSync(to, from, ignore) {

    try {
        for (var key in from) {
            if (!ignore.hasOwnProperty(key)) {
                to[key] = from[key];
            }
        }

        return to;
    } catch (error) {
        throw error;
    }

}


function patchData(to, from, ignore) {

    try {
        var patchedData = patchDataSync(to, from, ignore);
        return q.resolve(patchedData);
    } catch (error) {
        return q.reject(error);
    }

}


function processData(reqData, fileData) {
    try {
        reqData = reorderData(reqData);
        if(!Array.isArray(fileData)) fileData = [];
        fileData.push(reorderData(reqData))
        return q.resolve({
            reqData: reqData,
            fileData: fileData
        });
    } catch (error) {
        return err(error);
    }
}

function reorderData(data) {
    var _createdData = {};
    _createdData['__id'] = rand(10);
    for (var key in data) {
        if (key != "__id") _createdData[key] = data[key];
    }

    return _createdData;
}

function validateObject(data) {
    if (!(typeof data === 'object' && data.length === undefined)) {
        return new Error('Options are not in object');
    } else {
        return true;
    }

}


/**
 * return async Error
 */
function err(err) {
    return q.reject(err);
}





function collection(entity) {
    collectionName = entity;
    return {
        find: find,
        findOne: findOne,
        findMany: findMany,
        save: save,
        update: update,
        remove: remove
    }



    function find() {

        return getDocumentpath(collectionName)
            .then(readDocument)
            .catch(err);

    }

    function findOne(options) {

        if (!(typeof options === 'object' && options.length === undefined))
            return err(new Error('Options are not in object'));

        function matchOne(data) {
            return matchData(data, options, false);
        }
        return find()
            .then(matchOne)
            .then(extractData)
            .catch(err);

    }

    function findMany(options) {


        if (!(typeof options === 'object' && options.length === undefined))
            return err(new Error('Options are not in object'));

        function matchMany(data) {
            return matchData(data, options, true);
        }

        return find()
            .then(matchMany)
            .catch(err);
    }

    function save(data) {


        var savedData = null;

        function pushToMainData(fileData) {
            return processData(data, fileData);
        }

        function sendData() {
            return q.resolve(savedData);
        }

        function writeOnFile(processedData) {
            savedData = processedData.reqData;
            return writeDocument(processedData.fileData, collectionName)        
        }

        return find()
            .then(pushToMainData)
            .then(writeOnFile)
            .then(sendData)
            .catch(err);
    }


    function update(data, options) {

        if (!(typeof options === 'object' && options.length === undefined))
            return err(new Error('Options are not in object'));

        var fullData, updateIndex;

        function matchOne(_data) {
            fullData = _data;
            return matchData(_data, options, false);
        }

        function updateDate(foundData) {
            updateIndex = foundData.index;
            return patchData(foundData, data, options)
        }

        function writeData(data) {
            fullData.splice(updateIndex, 1, data);
            return writeDocument(fullData, collectionName);
        }

        return find()
            .then(matchOne)
            .then(updateDate)
            .then(writeData)
            .catch(err);


    }


    function remove() {

    }

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

            if (!Array.isArray(res.data)) res.data = [];

            res.data.push(err);

            writeData(res.data, res.file)
                .then(q.reject(error));

        })

}



/**
 * export methods
 */

module.exports = {
    collection: collection
};
'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

/**
 * Class ServerStore to simulate a local storage for the node layer
 * It will store the data in a json file in node server file system
 * NOTE: All the file operations are sync so it should be sparingly used
 * NOTE: IT SHOULD NOT BE USED AS A DATABASE
 * Data by default will be cached only for 1 hour and max size is 1 mb
 * Primary usage: To cache taxonomy calls which are not user dependent
 *
 * @param {String} appName required - name space for local store
 * @param {String} store required - name of the local store
 * @param {String} path optional - Local store path on node server, default: /tmp/store
 * @param {Number} expiryTime optional - cache expiry time in ms, default: 1 hr
 * @param {Number} maxFileSize optional - Max size of data to be stored, default: 1 mb
 *
 * @example
 *  const Store = require('server-store');
 *  const zipCodes = new Store('testApp', 'zipCodes');
 *
 * Setting data
 * zipCodes.setItem('ca-codes', [{xys:123},{xyz:4333}]);
 * @returns true
 *
 * Getting sored data
 * zipCodes.getItem('ca-codes');
 * @returns [{xys:123},{xyz:4333}]
 *
 * Clearing cache
 * zipCodes.clearCache(); //Clears local store content
 */


const _storeName = new WeakMap();
const _nameSpace = new WeakMap();
const _storeLocation = new WeakMap();
const _expires = new WeakMap();
const _maxFileSize = new WeakMap();
const _fileName = new WeakMap();

class ServerStore {
    constructor(appName, store, storepath, expiryTime, maxFileSize) {

        if (typeof appName !== 'string' || typeof store !== 'string') {
            return new Error('Invalid argument need to be a string');
        }

        if (expiryTime && typeof expiryTime !== 'number') {
            return new Error(
                'Invalid argument expiry time need to be number');
        }

        if (maxFileSize && typeof maxFileSize !== 'number') {
            return new Error(
                'Invalid argument max file size time need to be number'
            );
        }

        _nameSpace.set(this, appName);
        _storeName.set(this, store);
        _storeLocation.set(this, (storepath || '/tmp/store'));

        // Default is 1 hr
        _expires.set(this, (expiryTime || 3.6e+6));
        // Maxfile size 1 mb
        _maxFileSize.set(this, (maxFileSize || 1000000));

        _fileName.set(this, path.join(_storeLocation.get(this), _nameSpace.get(
                this) +
            '-' +
            _storeName.get(this) + '.json'));

        mkdirp.sync(_storeLocation.get(this));

        try {
            const file = fs.statSync(_fileName.get(this));
            if (file.size >= _maxFileSize.get(this)) {
                this._createFile();
            }
        } catch (err) {
            if (err) {
                if (err.code === 'ENOENT') {
                    try {
                        this._createFile();
                    } catch (e) {
                        return e;
                    }

                } else {
                    return err;
                }
            }
        }
    }

    _createFile() {
        fs.writeFileSync(_fileName.get(this), JSON.stringify(this._getBlankFile()));
    }

    _getBlankFile() {
        return {
            '_timeStamp': Date.now()
        };
    }

    _readFileSync() {
        try {
            let file = JSON.parse(fs.readFileSync(_fileName.get(this)));
            // Clear the stale data
            if ((Date.now() - file._timeStamp) > _expires.get(this)) {
                file = this._getBlankFile();
            }
            return file;
        } catch (err) {
            return err;
        }
    }

    _writeFileSync(data) {

        try {
            fs.writeFileSync(_fileName.get(this), JSON.stringify(data));
            return this._checkFileSize();
        } catch (err) {
            return err;
        }
    }

    _checkFileSize() {
        const file = fs.statSync(_fileName.get(this));
        return file.size <= _maxFileSize.get(this);
    }

    getItem(key) {
        const file = this._readFileSync();
        return file[key];
    }

    setItem(key, value) {
        let data = this._readFileSync();

        // Clear the stale data
        if ((Date.now() - data._timeStamp) > _expires.get(this)) {
            data = this._getBlankFile();
        }
        data[key] = value;
        return this._writeFileSync(data);
    }

    clearCache() {
        this._createFile();
    }
}
module.exports = ServerStore;

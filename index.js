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
 * @param {String} appName optional - name space for local store, default: suppliercenter
 * @param {String} store required - name of the local store
 * @param {String} path optional - Local store path on node server, default: /tmp/store
 * @param {Number} expires optional - cache expiry time in ms, default: 1 hr
 * @param {Number} maxFileSize optional - Max size of data to be stored, default: 1 mb
 *
 * @example
 *  const Store = require('index');
 *  const taxonomyStore = new Store('taxonomy');
 *
 * Setting data
 * taxonomyStore.setItem('categories', [{xys:123},{xyz:4333}]);
 * @returns true
 *
 * Getting sored data
 * taxonomyStore.getItem('categories');
 * @returns [{xys:123},{xyz:4333}]
 *
 * Clearing cache
 * taxonomyStore.createFile(); //Clears local store content
 */

class ServerStore {
    constructor(appName, store, storepath, expires, maxFileSize) {

        if (typeof appName !== 'string' || typeof store !== 'string') {
            return new Error('Invalid argument need to be a string');
        }

        if (expires && typeof expires !== 'number') {
            return new Error(
                'Invalid argument expiry time need to be number');
        }

        if (maxFileSize && typeof maxFileSize !== 'number') {
            return new Error(
                'Invalid argument max file size time need to be number'
            );
        }

        this._storeName = store;
        this._soreLocation = storepath || '/tmp/store';
        this._nameSpace = appName;


        // Default is 1 hr
        this._expires = expires || 3.6e+6;

        // MaXfile size 1 mb
        this._maxFileSize = maxFileSize || 1000000;

        this.fileName = path.join(this._soreLocation, this._nameSpace + '-' +
            this._storeName + '.json');

        mkdirp.sync(this._soreLocation);

        try {
            const file = fs.statSync(this.fileName);
            if (file.size >= this._maxFileSize) {
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
        fs.writeFileSync(this.fileName, JSON.stringify(this._getBlankFile()));
    }

    _getBlankFile() {
        return {
            '_timeStamp': Date.now()
        };
    }

    _readFileSync() {
        try {
            let file = JSON.parse(fs.readFileSync(this.fileName));
            // Clear the stale data
            if ((Date.now() - file._timeStamp) > this._expires) {
                file = this._getBlankFile();
            }
            return file;
        } catch (err) {
            return err;
        }
    }

    _writeFileSync(data) {

        try {
            fs.writeFileSync(this.fileName, JSON.stringify(data));
            return this._checkFileSize();
        } catch (err) {
            return err;
        }
    }

    _checkFileSize() {
        const file = fs.statSync(this.fileName);
        return file.size <= this._maxFileSize;
    }

    getItem(key) {
        const file = this._readFileSync();
        return file[key];
    }

    setItem(key, value) {
        let data = this._readFileSync();

        // Clear the stale data
        if ((Date.now() - data._timeStamp) > this._expires) {
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

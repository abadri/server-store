<!-- [![npm package](https://nodei.co/npm/server-store.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/server-store/) -->

[![Build status](https://img.shields.io/travis/abadri/server-store/master.svg?style=flat-square)](https://travis-ci.org/abadri/server-store)

# server-store
Local storage for nodejs which use filesystem to store data in JSON file.

## Use case:
If there is a downstream third party service that always returns same set of data for a given type of request and
which doesn't get updated frequently the we can cache the data at node layer instead of making a new service call.
e.g: https://xyz.com/api/getZipCodes?state=CA => [95000, 95001, ....]

We can use local DB to address this but for the application which is stateless or no DB or used only for orchestration

> This module writes/reads local file system in sync and async API is currently work in progress.

**NOTE: Please don't use this as a database to store critical information, please fall back to service in case of Errors**


# Features
* Create a local store for nodejs
* Set/Save data to the local store
* Get data from the local store
* Clear the local store
* Auto expire the data based on expiry time

# Usage
```js
npm install server-store --save
const Store = require('server-store');
const testStore = new Store('appName','storeName');
```
## To store data to local store
```js
testStore.setItem(key, value);
```

## To get data from store
```js
testStore.getItem(key);
```
## To clear all data from store
```js
testStore.clearCache();
```

### @Parameters

* appName - {Required} - {String} - application name used for name space
* storeName - {Required} - {String} - Data store name
* path - {optional} - String - folder path where node can create/read/write store. Default: /tmp/store
* expiryTime - {optional} - Number - Store expiry time in milli seconds. Default 1 hr
* maxStoreSize - {optional} - Number - Maximum store size in bytes. Default 1 mb

'use strict';

const expect = require('chai').expect;
const should = require('chai').should;
const assert = require('chai').assert;
const Store = require('../index');
const mockData = require('./mock');

describe('#createStore', function() {


    it('It should throw an error for invalid parameters', function() {
        const test = new Store();
        expect(test).to.be.an('error');
    });

    it('It should throw an error for invalid parameters', function() {
        const test = new Store('testApp');
        expect(test).to.be.an('error');
    });


    it('It should throw error for invalid paths', function() {
        const test = new Store('testApp', 'testStore', '/');
        expect(test).to.be.an('error');
    });

    it('It should throw error for invalid expiry time', function() {
        const test = new Store('testApp', 'testStore',
            '/tmp/store', '123');

        expect(test).to.be.an('error');
    });

    it('It should throw error for invalid max file size', function() {
        const test = new Store('testApp', 'testStore',
            '/tmp/store', 123, '45');
        expect(test).to.be.an('error');
    });

    it('It should return store object', function() {
        const test = new Store('testApp', 'testStore');
        expect(test).to.be.an('object');

        expect(test).to.have.property('setItem');
        expect(test).to.have.property('getItem');
        expect(test).to.have.property('clearCache');
    });


});

describe('#setValuesToStore', function() {

    const test = new Store('testApp', 'testStore');

    it('Should set a string data', function() {
        const data = test.setItem('testString',
            'testValue');

        assert.equal(data, true);
    });

    it('Should set a array data', function() {
        const data = test.setItem('testArray', [1, 2, 3]);

        assert.equal(data, true);
    });

    it('Should set a array data', function() {
        const data = test.setItem('testObj', {
            one: 1,
            two: 2,
            three: 3
        });

        assert.equal(data, true);
    });
});

describe('#getValuesToStore', function() {

    const testGet = new Store('testApp', 'testStore');

    it('Should get a string data', function() {
        const data = testGet.getItem('testString');

        assert.equal(data, 'testValue');
    });

    it('Should get a array data', function() {
        const data = testGet.getItem('testArray');

        assert.deepEqual(data, [1, 2, 3]);
    });

    it('Should get a array data', function() {
        const data = testGet.getItem('testObj');

        assert.deepEqual(data, {
            one: 1,
            two: 2,
            three: 3
        });
    });
});

describe('#checkBigSizeWrites', function() {

    const test = new Store('testApp', 'testStore');

    it('Should not store data bigger than 1 mb', function() {
        const data = test.setItem('big', mockData);
        assert.equal(data, false);
    });
});

describe('#checkForExpiryTime', function() {

    const test = new Store('testApp', 'testStore', '/tmp/store', 10);
    const data = test.setItem('testTimeout', 100);
    it('Should expire data after certain time', function() {

        this.timeout(20000);
        assert.equal(test.getItem('testTimeout'), undefined);
    });
});

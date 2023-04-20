const mineget = require('../src/mineget.js');
const assert = require('assert');

describe('mineget', function () {
    describe('#get() method with spigot platform', function () {
        it('should return an array', function () {
            mineget.get({ 'spigot': '83767' }, function (err, data) {
                assert.equal(Array.isArray(data), true);
            });
        });

        it('should return name as HuskHomes', function () {
            mineget.get({ 'spigot': '83767' }, function (err, data) {
                assert.equal(data.name, 'HuskHomes');
            });
        });

        it('should return a total_downloads', function () {
            mineget.get({ 'spigot': '83767' }, function (err, data) {
                assert.notEqual(data.total_downloads, null);
            });
        });

        it('should return a average_rating', function () {
            mineget.get({ 'spigot': '83767' }, function (err, data) {
                assert.notEqual(data.average_rating, null);
            });
        });

        it('should return a rating_count', function () {
            mineget.get({ 'spigot': '83767' }, function (err, data) {
                assert.notEqual(data.rating_count, null);
            });
        });

        it('should return a latest_version', function () {
            mineget.get({ 'spigot': '83767' }, function (err, data) {
                assert.notEqual(data.latest_version, null);
            });
        });

        it('should return a last_updated', function () {
            mineget.get({ 'spigot': '83767' }, function (err, data) {
                assert.notEqual(data.last_updated, null);
            });
        });
    });

    // test github
    describe('#get() method with github platform', function () {
        it('should return an array', function () {
            mineget.get({ 'github': 'WiIIiam278/HuskHomes' }, function (err, data) {
                assert.equal(Array.isArray(data), true);
            });
        });
        
        it('should return a total_downloads', function () {
            mineget.get({ 'github': 'WiIIiam278/HuskHomes' }, function (err, data) {
                assert.notEqual(data.total_downloads, null);
            });
        });

    });

});
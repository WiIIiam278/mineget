import assert from "assert";
import mineget from "../src/mineget";

const freeResource = 284;
const premiumResource = 1056;

describe('Polymart', function () {
    describe('the #name() function', function () {
        it('should return name as string', function () {
            return mineget.name({ polymart: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.polymart.name, 'string');
                });
        });
    })

    describe('the #downloads() function', function () {
        it('should return downloads as number', function () {
            return mineget.downloads({ polymart: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.polymart.downloads, 'number');
                });
        });
    });

    describe('the #latest_version() function', function () {
        it('should return version as a string', function () {
            return mineget.latest_version({ polymart: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.polymart.version, 'string');
                });
        });

        it('should return published as a number', function () {
            return mineget.latest_version({ polymart: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.polymart.published, 'number')
                });
        });
    });

    describe('the #rating() function', function () {
        it('should return average as a number', function () {
            return mineget.rating({ polymart: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.polymart.average, 'number');
                });
        });

        it('should return count as a number', function () {
            return mineget.rating({ polymart: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.polymart.count, 'number')
                });
        });
    });

    describe('the #price() function', function () {
        it('should return price as a number', function () {
            return mineget.price({ polymart: premiumResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.polymart.price, 'number')
                });
        });

        it('should return currency as a string', function () {
            return mineget.price({ polymart: premiumResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.polymart.currency, 'string')
                });
        });
    });

})
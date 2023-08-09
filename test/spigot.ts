import assert from "assert";
import mineget from "../src/mineget";

const freeResource = 83767;
const premiumResource = 92672;

describe('Spigot', function () {
    describe('the #name() function', function () {
        it('should return name as string', function () {
            return mineget.name({ spigot: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.spigot.name, 'string');
                });
        });
    })

    describe('the #downloads() function', function () {
        it('should return downloads as number', function () {
            return mineget.downloads({ spigot: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.spigot.downloads, 'number');
                });
        });
    });

    describe('the #latest_version() function', function () {
        it('should return version as a string', function () {
            return mineget.latest_version({ spigot: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.spigot.version, 'string');
                });
        });

        it('should return published as a number', function () {
            return mineget.latest_version({ spigot: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.spigot.published, 'number')
                });
        });
    });

    describe('the #rating() function', function () {
        it('should return average as a number', function () {
            return mineget.rating({ spigot: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.spigot.average, 'number');
                });
        });

        it('should return count as a number', function () {
            return mineget.rating({ spigot: freeResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.spigot.count, 'number')
                });
        });
    });

    describe('the #price() function', function () {
        it('should return price as a number', function () {
            return mineget.price({ spigot: premiumResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.spigot.price, 'number')
                });
        });

        it('should return currency as a string', function () {
            return mineget.price({ spigot: premiumResource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.spigot.currency, 'string')
                });
        });
    });

})
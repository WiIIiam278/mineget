import assert from "assert";
import mineget from "../src/mineget";

const resource = 622;

describe('Craftaro', function () {
    describe('the #name() function', function () {
        it('should return name as string', function () {
            return mineget.name({ craftaro: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.craftaro.name, 'string');
                });
        });
    });

    describe('the #rating() function', function () {
        it('should return average as a number', function () {
            return mineget.rating({ craftaro: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.craftaro.average, 'number');
                });
        });

        it('should return count as a number', function () {
            return mineget.rating({ craftaro: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.craftaro.count, 'number')
                });
        });
    });

    describe('the #price() function', function () {
        it('should return price as a number', function () {
            return mineget.price({ craftaro: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.craftaro.price, 'number')
                });
        });

        it('should return currency as a string', function () {
            return mineget.price({ craftaro: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.craftaro.currency, 'string')
                });
        });
    });

    describe('the #downloads() function', function () {
        it('should return downloads as number', function () {
            return mineget.downloads({ craftaro: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.craftaro.downloads, 'number');
                });
        });
    });

})
import assert from "assert";
import mineget from "../src/mineget";

describe('mineget', function () {
    describe('#price() method on all platforms', function () {
        describe('for spigot it', function () {
            it('should return the price as a number', async function () {
                const res = await mineget.price({ spigot: 92672 });
                assert.strictEqual(typeof res.endpoints['spigot'].price, 'number')
            });

            it('should return the currency as a string', async function () {
                const res = await mineget.price({ spigot: 92672 });
                assert.strictEqual(typeof res.endpoints['spigot'].currency, 'string');
            });

            it('should return the lowest_price as a number', async function () {
                const res = await mineget.price({ spigot: 92672 });
                assert.strictEqual(typeof res.lowest_price, 'number');
            });

            it('should return the lowest_currency as a string', async function () {
                const res = await mineget.price({ spigot: 92672 });
                assert.strictEqual(typeof res.lowest_price_currency, 'string');
            });
        });

        describe('for polymart it', function () {
            it('should return the price as a number', async function () {
                const res = await mineget.price({ polymart: 1056 });
                assert.strictEqual(typeof res.endpoints['polymart'].price, 'number')
            });

            it('should return the currency as a string', async function () {
                const res = await mineget.price({ polymart: 1056 });
                assert.strictEqual(typeof res.endpoints['polymart'].currency, 'string');
            });

            it('should return the lowest_price as a number', async function () {
                const res = await mineget.price({ polymart: 1056 });
                assert.strictEqual(typeof res.lowest_price, 'number');
            });

            it('should return the lowest_currency as a string', async function () {
                const res = await mineget.price({ polymart: 1056 });
                assert.strictEqual(typeof res.lowest_price_currency, 'string');
            });
        });

        describe('for craftaro it', function () {
            it('should return the price as a number', async function () {
                const res = await mineget.price({ craftaro: 622 });
                assert.strictEqual(typeof res.endpoints['craftaro'].price, 'number')
            });

            it('should return the currency as a string', async function () {
                const res = await mineget.price({ craftaro: 622 });
                assert.strictEqual(typeof res.endpoints['craftaro'].currency, 'string');
            });

            it('should return the lowest_price as a number', async function () {
                const res = await mineget.price({ craftaro: 622 });
                assert.strictEqual(typeof res.lowest_price, 'number');
            });

            it('should return the lowest_currency as a string', async function () {
                const res = await mineget.price({ craftaro: 622 });
                assert.strictEqual(typeof res.lowest_price_currency, 'string');
            });
        });

    });
});
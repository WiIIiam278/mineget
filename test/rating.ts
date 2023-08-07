import mineget from "../src/mineget";
import assert from "assert";

describe('mineget', function () {
    describe('#rating() method on all platforms', function () {
        describe('for spigot it', function () {
            it('should return the average as a number', async function () {
                const res = await mineget.rating({ spigot: 92672 });
                assert.strictEqual(typeof res.endpoints['spigot'].average, 'number');
            });
            it('should return the count as a number', async function () {
                const res = await mineget.rating({ spigot: 92672 });
                assert.strictEqual(typeof res.endpoints['spigot'].count, 'number');
            });
        });
        describe('for polymart it', function () {
            it('should return the average as a number', async function () {
                const res = await mineget.rating({ polymart: 1634 });
                assert.strictEqual(typeof res.endpoints['polymart'].average, 'number');
            });
            it('should return the count as a number', async function () {
                const res = await mineget.rating({ polymart: 1634 });
                assert.strictEqual(typeof res.endpoints['polymart'].count, 'number');
            });
        });
        describe('for craftaro it', function () {
            it('should return the average as a number', async function () {
                const res = await mineget.rating({ craftaro: 758 });
                assert.strictEqual(typeof res.endpoints['craftaro'].average, 'number');
            });
            it('should return the count as a number', async function () {
                const res = await mineget.rating({ craftaro: 758 });
                assert.strictEqual(typeof res.endpoints['craftaro'].count, 'number');
            });
        });
    })
});
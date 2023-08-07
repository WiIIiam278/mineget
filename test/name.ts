import mineget from "../src/mineget";
import assert from "assert";

describe('mineget', function () {
    describe('#name() method on all platforms', function () {
        describe('for spigot it', function () {
            it('should return the name as a string', async function () {
                const res = await mineget.name({ spigot: 92672 });
                assert.strictEqual(typeof res.endpoints['spigot'].name, 'string');
            });
        });
        describe('for polymart it', function () {
            it('should return the name as a string', async function () {
                const res = await mineget.name({ polymart: 1056 });
                assert.strictEqual(typeof res.endpoints['polymart'].name, 'string');
            });
        });
        describe('for modrinth it', function () {
            it('should return the name as a string', async function () {
                const res = await mineget.name({ modrinth: "J6U9o3JG" });
                assert.strictEqual(typeof res.endpoints['modrinth'].name, 'string');
            });
        });
        describe('for craftaro it', function () {
            it('should return the name as a string', async function () {
                const res = await mineget.name({ craftaro: 758 });
                assert.strictEqual(typeof res.endpoints['craftaro'].name, 'string');
            });
        });
        describe('for github it', function () {
            it('should return the name as a string', async function () {
                const res = await mineget.name({ github: "WiIIiam278/HuskHomes" });
                assert.strictEqual(typeof res.endpoints['github'].name, 'string');
            });
        });
    })
});
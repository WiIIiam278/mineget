import mineget from "../src/mineget";
import assert from "assert";

describe('mineget', function () {
    describe('#latest_version() method on all platforms', function () {
        describe('for spigot it', function () {
            it('should return the version as a string', async function () {
                const res = await mineget.latest_version({ spigot: 92672 });
                assert.strictEqual(typeof res.endpoints['spigot'].version, 'string');
            });
            it('should return the published as a number', async function () {
                const res = await mineget.latest_version({ spigot: 92672 });
                assert.strictEqual(typeof res.endpoints['spigot'].published, 'number');
            });
        });
        describe('for polymart it', function () {
            it('should return the version as a string', async function () {
                const res = await mineget.latest_version({ polymart: 1634 });
                assert.strictEqual(typeof res.endpoints['polymart'].version, 'string');
            });
            it('should return the published as a number', async function () {
                const res = await mineget.latest_version({ polymart: 1634 });
                assert.strictEqual(typeof res.endpoints['polymart'].published, 'number');
            });
        });
        describe('for github it', function () {
            it('should return the version as a string', async function () {
                const res = await mineget.latest_version({ github: "WiIIiam278/HuskHomes" });
                assert.strictEqual(typeof res.endpoints['github'].version, 'string');
            });
            it('should return the published as a number', async function () {
                const res = await mineget.latest_version({ github: "WiIIiam278/HuskHomes" });
                assert.strictEqual(typeof res.endpoints['github'].published, 'number');
            });
        });
    })
});
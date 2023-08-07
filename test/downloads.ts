import mineget from "../src/mineget";
import assert from "assert";

describe('mineget', function () {
    describe('#downloads() method on all platforms', function () {
        describe('for spigot it', function () {
            it('should return the downloads as a number', async function () {
                const res = await mineget.downloads({ spigot: 92672 });
                assert.strictEqual(typeof res.endpoints['spigot'].downloads, 'number');
            });
        });
        describe('for polymart it', function () {
            it('should return the downloads as a number', async function () {
                const res = await mineget.downloads({ polymart: 1056 });
                assert.strictEqual(typeof res.endpoints['polymart'].downloads, 'number');
            });
        });
        describe('for modrinth it', function () {
            it('should return the downloads as a number', async function () {
                const res = await mineget.downloads({ modrinth: "J6U9o3JG" });
                assert.strictEqual(typeof res.endpoints['modrinth'].downloads, 'number');
            });
        });
    })
});
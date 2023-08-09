import assert from "assert";
import mineget from "../src/mineget";

const resource = "wiIIiam278/HuskHomes"

describe('Github', function () {
    describe('the #name() function', function () {
        it('should return name as string', function () {
            return mineget.name({ github: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.github.name, 'string');
                });
        });
    })

    describe('the #latest_version() function', function () {
        it('should return version as a string', function () {
            return mineget.latest_version({ github: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.github.version, 'string');
                });
        });

        it('should return published as a number', function () {
            return mineget.latest_version({ github: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.github.published, 'number')
                });
        });
    });

});
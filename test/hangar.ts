import assert from "assert";
import mineget from "../src/mineget";

const resource = "William278/HuskHomes";

describe('Hangar', function () {
    describe('the #name() function', function () {
        it('should return name as string', function () {
            return mineget.name({ hangar: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.hangar.name, 'string');
                });
        });
    });

    describe('the #downloads() function', function () {
        it('should return downloads as number', function () {
            return mineget.downloads({ hangar: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.hangar.downloads, 'number');
                });
        });
    });

})
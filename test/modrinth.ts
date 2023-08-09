import assert from "assert";
import mineget from "../src/mineget";

const resource = "Q10irTG0"

describe('Modrinth', function () {
    describe('the #name() function', function () {
        it('should return name as string', function () {
            return mineget.name({ modrinth: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.modrinth.name, 'string');
                });
        });
    })

    describe('the #downloads() function', function () {
        it('should return downloads as number', function () {
            return mineget.downloads({ modrinth: resource })
                .then((res) => {
                    return assert.strictEqual(typeof res.endpoints.modrinth.downloads, 'number');
                });
        });
    });

})
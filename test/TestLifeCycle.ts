import "mocha";
import {expect} from "chai";
import {SmokeScreenLifecycle} from "../src/SmokeScreenLifecycle";
import {SmokeScreen} from "../src/SmokeScreen";

describe("Test SmokeScreenLifecycle", () => {

    const smokeScreen = new SmokeScreen();

    it("Test beforeSerialize", () => {

        class Test implements SmokeScreenLifecycle {

            beforeSerialize() {
                throw new Error();
            }

        }

        smokeScreen.fromObject({}, Test); // should pass
        expect(() => smokeScreen.toJSON(new Test())).to.throw(Error);

    });

    it("Test afterDeserialize", () => {

        class Test implements SmokeScreenLifecycle {

            afterDeserialize() {
                throw new Error();
            }

        }

        smokeScreen.toJSON(new Test()); // should pass
        expect(() => smokeScreen.fromObject({}, Test)).to.throw(Error);

    });

    it("Test all", () => {

        class Test implements SmokeScreenLifecycle {

            beforeSerialize() {
                throw new Error();
            }

            afterDeserialize() {
                throw new Error();
            }

        }

        expect(() => smokeScreen.toJSON(new Test())).to.throw(Error);
        expect(() => smokeScreen.fromObject({}, Test)).to.throw(Error);

    });

});

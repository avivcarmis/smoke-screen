import "mocha";
import {expect} from "chai";
import {SmokeScreen} from "../src/SmokeScreen";
import {exposed} from "../src/exposed";

describe("Test unexposed properties", () => {

    class Test {

        @exposed()
        exposedProperty: string;

        unexposedProperty: string;

        constructor(exposedProperty: string, unexposedProperty: string) {
            this.exposedProperty = exposedProperty;
            this.unexposedProperty = unexposedProperty;
        }

    }

    const smokeScreen = new SmokeScreen();

    it("Test toObject", () => {

        const test = new Test("exposed", "unexposed");
        const exposure = smokeScreen.toObject(test);
        expect(exposure.exposedProperty).to.equal("exposed");
        expect(exposure).to.not.haveOwnProperty("unexposedProperty");

    });

    it("Test fromObject", () => {

        const exposure = {exposedProperty: "exposed", unexposedProperty: "unexposed"};
        const test = smokeScreen.fromObject(exposure, Test);
        expect(test.exposedProperty).to.equal("exposed");
        expect(typeof test.unexposedProperty).to.equal("undefined");

    });

    it("Test toJSON", () => {

        const test = new Test("exposed", "unexposed");
        const exposure = JSON.parse(smokeScreen.toJSON(test));
        expect(exposure.exposedProperty).to.equal("exposed");
        expect(exposure).to.not.haveOwnProperty("unexposedProperty");

    });

    it("Test fromJSON", () => {

        const exposure = {exposedProperty: "exposed", unexposedProperty: "unexposed"};
        const test = smokeScreen.fromJSON(JSON.stringify(exposure), Test);
        expect(test.exposedProperty).to.equal("exposed");
        expect(typeof test.unexposedProperty).to.equal("undefined");

    });

});

import "mocha";
import {expect} from "chai";
import {exposed} from "../src/interfaces";
import {SmokeScreen} from "../src/SmokeScreen";

describe("Test unexposed properties", () => {

    class Test {

        @exposed()
        exposed: string;

        unexposed: string;

    }

    const smokeScreen = new SmokeScreen();

    it("Test toObject", () => {

        const test = new Test();
        test.exposed = "exposed";
        test.unexposed = "unexposed";
        const exposure = smokeScreen.toObject(test);
        expect(exposure.exposed).to.equal("exposed");
        expect(exposure).to.not.haveOwnProperty("unexposed");

    });

    it("Test fromObject", () => {

        const exposure = {exposed: "exposed", unexposed: "unexposed"};
        const test = smokeScreen.fromObject(exposure, Test);
        expect(test.exposed).to.equal("exposed");
        expect(test).to.not.haveOwnProperty("unexposed");

    });

    it("Test toJSON", () => {

        const test = new Test();
        test.exposed = "exposed";
        test.unexposed = "unexposed";
        const exposure = JSON.parse(smokeScreen.toJSON(test));
        expect(exposure.exposed).to.equal("exposed");
        expect(exposure).to.not.haveOwnProperty("unexposed");

    });

    it("Test fromJSON", () => {

        const exposure = {exposed: "exposed", unexposed: "unexposed"};
        const test = smokeScreen.fromJSON(JSON.stringify(exposure), Test);
        expect(test.exposed).to.equal("exposed");
        expect(test).to.not.haveOwnProperty("unexposed");

    });

});
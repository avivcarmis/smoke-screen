import "mocha";
import {expect} from "chai";
import {SmokeScreen} from "../src/SmokeScreen";
import {PropertyType} from "../src/PropertyType";
import {exposed} from "../src/exposed";

describe("Test exposure settings", () => {

    it("Test exposing as", () => {

        class Test {

            @exposed({as: "exposedPropertyName"})
            property: string;

        }

        const smokeScreen = new SmokeScreen();
        const test = new Test();
        test.property = "value";
        const exposure = smokeScreen.toObject(test);
        expect(exposure.exposedPropertyName).to.equal("value");
        expect(exposure).to.not.haveOwnProperty("property");

    });

    describe("Test exposure property type", () => {

        class TestType implements PropertyType {

            visitedOutput = false;

            visitedInput = false;

            serialize(_smokeScreen: SmokeScreen, value: any): any {
                this.visitedOutput = true;
                return value;
            }

            deserialize(_smokeScreen: SmokeScreen, value: any): any {
                this.visitedInput = true;
                return value;
            }

        }

        it("Test serialize", () => {

            const testType = new TestType();

            class Test {

                @exposed({type: testType})
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            const test = new Test();
            test.property = "value";
            smokeScreen.toJSON(test);
            expect(testType.visitedOutput).to.equal(true);
            expect(testType.visitedInput).to.equal(false);

        });

        it("Test deserialize", () => {

            const testType = new TestType();

            class Test {

                @exposed({type: testType})
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            smokeScreen.fromObject({property: "value"}, Test);
            expect(testType.visitedInput).to.equal(true);
            expect(testType.visitedOutput).to.equal(false);

        });

    });

    describe("Test exposure validator", () => {

        it("Test translation", () => {

            class Test {

                @exposed({validator: value => value + "-suffix"})
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            const test = smokeScreen.fromObject({property: "prefix"}, Test);
            expect(test.property).to.equal("prefix-suffix");

        });

        it("Test failure", () => {

            class Test {

                @exposed({validator: () => {
                    throw new Error("");
                }})
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            expect(() => smokeScreen.fromObject({property: "prefix"}, Test))
                .to.throw(Error);

        });

    });

    describe("Test optional property", () => {

        it("Test required", () => {

            class Test {

                @exposed
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            expect(() => smokeScreen.fromObject({}, Test)).to.throw(Error);

        });

        it("Test optional", () => {

            class Test {

                @exposed({optional: true})
                property = "value1";

            }

            const smokeScreen = new SmokeScreen();
            const test = smokeScreen.fromObject({}, Test);
            expect(test.property).to.equal("value1");

        });

    });

    describe("Test nullable", () => {

        it("Test failure", () => {

            class Test {

                @exposed
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            expect(() => smokeScreen.fromObject({property: null}, Test))
                .to.throw(Error);

        });

        it("Test success", () => {

            class Test {

                @exposed({nullable: true})
                property: string | null;

            }

            const smokeScreen = new SmokeScreen();
            const test = smokeScreen.fromObject({property: null}, Test);
            expect(test.property).to.equal(null);

        });

    });

});

import "mocha";
import {expect} from "chai";
import {exposed, PropertyType} from "../src/interfaces";
import {SmokeScreen} from "../src/SmokeScreen";

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

            translateOutput(_smokeScreen: SmokeScreen, value: any): any {
                this.visitedOutput = true;
                return value;
            }

            translateInput(_smokeScreen: SmokeScreen, value: any): any {
                this.visitedInput = true;
                return value;
            }

        }

        it("Test exposure property type output", () => {

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

        it("Test exposure property type input", () => {

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

        it("Test exposure validator translation", () => {

            class Test {

                @exposed({validator: value => value + "-suffix"})
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            const test = smokeScreen.fromObject({property: "prefix"}, Test);
            expect(test.property).to.equal("prefix-suffix");

        });

        it("Test exposure validator failure", () => {

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

    describe("Test default value", () => {

        it("Test required property", () => {

            class Test {

                @exposed
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            expect(() => smokeScreen.fromObject({}, Test)).to.throw(Error);

        });

        it("Test optional property", () => {

            class Test {

                @exposed({defaultValue: "value1"})
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            const test = smokeScreen.fromObject({}, Test);
            expect(test.property).to.equal("value1");

        });

    });

    describe("Test nullable", () => {

        it("Test nullable success", () => {

            class Test {

                @exposed
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            expect(() => smokeScreen.fromObject({property: null}, Test))
                .to.throw(Error);

        });

        it("Test optional property", () => {

            class Test {

                @exposed({nullable: true})
                property: string;

            }

            const smokeScreen = new SmokeScreen();
            const test = smokeScreen.fromObject({property: null}, Test);
            expect(test.property).to.equal(null);

        });

    });

});

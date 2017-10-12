import "mocha";
import {expect} from "chai";
import {exposed, PropertyType} from "../src/interfaces";
import {SmokeScreen} from "../src/SmokeScreen";

describe("Test value translation", () => {

    const TRANSLATED_OUTPUT = "output";
    const TRANSLATED_INPUT = "input";
    const smokeScreen = new SmokeScreen();

    describe("Test property type translation", () => {

        it("Test translating property type", () => {

            class TranslatingPropertyType implements PropertyType {

                translateOutput(_smokeScreen: SmokeScreen, _value: any): any {
                    return TRANSLATED_OUTPUT;
                }

                translateInput(_smokeScreen: SmokeScreen, _value: any): any {
                    return TRANSLATED_INPUT;
                }

            }

            class Test {

                @exposed({type: new TranslatingPropertyType()})
                property: string;

            }

            const test = new Test();
            test.property = "value";
            const serialized = smokeScreen.toObject(test);
            expect(serialized.property).to.equal(TRANSLATED_OUTPUT);
            const deserialized = smokeScreen.fromObject(serialized, Test);
            expect(deserialized.property).to.equal(TRANSLATED_INPUT);

        });

        it("Test transparent property type", () => {

            class TransparentPropertyType implements PropertyType {

                translateOutput(_smokeScreen: SmokeScreen, _value: any): any {
                    return;
                }

                translateInput(_smokeScreen: SmokeScreen, _value: any): any {
                    return;
                }

            }

            class Test {

                @exposed({type: new TransparentPropertyType()})
                property: string;

            }

            const test = new Test();
            test.property = "value";
            const serialized = smokeScreen.toObject(test);
            expect(serialized.property).to.equal(test.property);
            const deserialized = smokeScreen.fromObject(serialized, Test);
            expect(deserialized.property).to.equal(test.property);

        });

    });

    describe("Test validator translation", () => {

        it("Test translating validator", () => {

            class Test {

                @exposed({validator: _value => TRANSLATED_INPUT})
                property: string;

            }

            const deserialized = smokeScreen.fromObject({property: "value"}, Test);
            expect(deserialized.property).to.equal(TRANSLATED_INPUT);

        });

        it("Test transparent validator", () => {

            class Test {

                @exposed({validator: _value => {
                    return;
                }})
                property: string;

            }

            const deserialized = smokeScreen.fromObject({property: "value"}, Test);
            expect(deserialized.property).to.equal("value");

        });

    });

});

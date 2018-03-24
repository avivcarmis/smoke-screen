import "mocha";
import {expect} from "chai";
import {SmokeScreen} from "../src/SmokeScreen";
import {PropertyType} from "../src/PropertyType";
import {exposed} from "../src/exposed";

describe("Test value translation", () => {

    const TRANSLATED_OUTPUT = "output";
    const TRANSLATED_INPUT = "input";
    const smokeScreen = new SmokeScreen();

    describe("Test property type translation", () => {

        it("Test translating property type", () => {

            class TranslatingPropertyType implements PropertyType {

                serialize(_smokeScreen: SmokeScreen, _value: any): any {
                    return TRANSLATED_OUTPUT;
                }

                deserialize(_smokeScreen: SmokeScreen, _value: any): any {
                    return TRANSLATED_INPUT;
                }

            }

            class Test {

                @exposed({type: new TranslatingPropertyType()})
                property: string;

                constructor(property: string) {
                    this.property = property;
                }

            }

            const test = new Test("value");
            const serialized = smokeScreen.toObject(test);
            expect(serialized.property).to.equal(TRANSLATED_OUTPUT);
            const deserialized = smokeScreen.fromObject(serialized, Test);
            expect(deserialized.property).to.equal(TRANSLATED_INPUT);

        });

        it("Test transparent property type", () => {

            class TransparentPropertyType implements PropertyType {

                serialize(_smokeScreen: SmokeScreen, _value: any): any {
                    return;
                }

                deserialize(_smokeScreen: SmokeScreen, _value: any): any {
                    return;
                }

            }

            class Test {

                @exposed({type: new TransparentPropertyType()})
                property: string;

                constructor(property: string) {
                    this.property = property;
                }

            }

            const test = new Test("value");
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

                constructor(property: string) {
                    this.property = property;
                }

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

                constructor(property: string) {
                    this.property = property;
                }

            }

            const deserialized = smokeScreen.fromObject({property: "value"}, Test);
            expect(deserialized.property).to.equal("value");

        });

    });

});

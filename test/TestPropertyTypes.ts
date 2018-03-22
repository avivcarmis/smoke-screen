import "mocha";
import {expect} from "chai";
import {SmokeScreen} from "../src/SmokeScreen";
import {EnumType, MapType} from "../src/PropertyType";
import {exposed} from "../src/exposed";

describe("Test property types", () => {

    const smokeScreen = new SmokeScreen();

    describe("Test string property type", () => {

        class Test {

            @exposed({type: "string"})
            property: string;

        }

        it("Test string property type success", () => {

            const test = smokeScreen.fromObject({property: "value"}, Test);
            expect(test.property).to.equal("value");

        });

        it("Test string property type failure", () => {

            expect(() => smokeScreen.fromObject({property: true}, Test))
                .to.throw(Error);

        });

    });

    describe("Test number property type", () => {

        class Test {

            @exposed({type: "number"})
            property: number;

        }

        it("Test number property type success", () => {

            const test = smokeScreen.fromObject({property: 5}, Test);
            expect(test.property).to.equal(5);

        });

        it("Test number property type failure", () => {

            expect(() => smokeScreen.fromObject({property: true}, Test))
                .to.throw(Error);

        });

    });

    describe("Test boolean property type", () => {

        class Test {

            @exposed({type: "boolean"})
            property: boolean;

        }

        it("Test boolean property type success", () => {

            const test = smokeScreen.fromObject({property: true}, Test);
            expect(test.property).to.equal(true);

        });

        it("Test boolean property type failure", () => {

            expect(() => smokeScreen.fromObject({property: "value"}, Test))
                .to.throw(Error);

        });

    });

    describe("Test enum property type", () => {

        enum TestEnum {

            FIRST_VALUE,
            SECOND_VALUE

        }

        it("Test enum property type success", () => {

            class Test {

                @exposed({type: TestEnum})
                property: TestEnum;

            }

            let test = smokeScreen.fromObject({property: "FIRST_VALUE"}, Test);
            expect(test.property).to.equal(TestEnum.FIRST_VALUE);
            test = smokeScreen.fromObject({property: "second_value"}, Test);
            expect(test.property).to.equal(TestEnum.SECOND_VALUE);

        });

        it("Test enum property type failure", () => {

            class Test {

                @exposed({type: EnumType(TestEnum, true)})
                property: TestEnum;

            }

            expect(() => smokeScreen.fromObject({property: true}, Test))
                .to.throw(Error);
            expect(() => smokeScreen.fromObject({property: "second_value"}, Test))
                .to.throw(Error);

        });

    });

    describe("Test object property type", () => {

        class NestedClass {

            @exposed({type: "string"})
            nestedProperty: string;

        }

        class Test {

            @exposed({type: NestedClass})
            property: NestedClass;

        }

        it("Test object property type success", () => {

            const exposure = {property: {nestedProperty: "value"}};
            const test = smokeScreen.fromObject(exposure, Test);
            expect(test.property.nestedProperty).to.equal("value");

        });

        it("Test object property type failure", () => {

            const exposure = {property: {nestedProperty: false}};
            expect(() => smokeScreen.fromObject(exposure, Test)).to.throw(Error);

        });

    });

    describe("Test map property type", () => {

        class Test {

            @exposed({type: MapType("string")})
            property: Map<string, string>;

        }

        it("Test map property type success", () => {

            const exposure = {property: {key1: "value1", key2: "value2"}};
            const test = smokeScreen.fromObject(exposure, Test);
            expect(test.property.size).to.equal(2);
            expect(test.property.has("key1")).to.equal(true);
            expect(test.property.get("key1")).to.equal("value1");
            expect(test.property.has("key2")).to.equal(true);
            expect(test.property.get("key2")).to.equal("value2");

        });

        it("Test map property type failure", () => {

            const exposure = {property: {key1: false, key2: "value2"}};
            expect(() => smokeScreen.fromObject(exposure, Test)).to.throw(Error);

        });

    });

    describe("Test array property type", () => {

        describe("Test primitive array property type", () => {

            class Test {

                @exposed({type: ["string"]})
                property: string[];

            }

            it("Test primitive array property type success", () => {

                const array = ["value1", "value2"];
                const test = smokeScreen.fromObject({property: array}, Test);
                expect(test.property).to.deep.equal(array);

            });

            it("Test primitive array property type failure", () => {

                expect(() => smokeScreen.fromObject({property: true}, Test))
                    .to.throw(Error);

            });

        });

        describe("Test enum array property type", () => {

            enum TestEnum {

                FIRST_VALUE,
                SECOND_VALUE

            }

            class Test {

                @exposed({type: [TestEnum]})
                property: TestEnum[];

            }

            it("Test enum array property type success", () => {

                const array = ["FIRST_VALUE", "SECOND_VALUE"];
                const test = smokeScreen.fromObject({property: array}, Test);
                expect(test.property).to.deep.equal([TestEnum.FIRST_VALUE,
                    TestEnum.SECOND_VALUE]);

            });

            it("Test enum array property type failure", () => {

                expect(() => smokeScreen.fromObject({property: true}, Test))
                    .to.throw(Error);

            });

        });

        describe("Test object array property type", () => {

            class NestedClass {

                @exposed({type: "string"})
                nestedProperty: string;

            }

            class Test {

                @exposed({type: [NestedClass]})
                property: NestedClass[];

            }

            it("Test object array property type success", () => {

                const exposure = {
                    property: [{nestedProperty: "value1"}, {nestedProperty: "value2"}]
                };
                const test = smokeScreen.fromObject(exposure, Test);
                expect(test.property.length).to.equal(2);
                expect(test.property[0] instanceof NestedClass).to.equal(true);
                expect(test.property[0].nestedProperty).to.equal("value1");
                expect(test.property[1] instanceof NestedClass).to.equal(true);
                expect(test.property[1].nestedProperty).to.equal("value2");

            });

            it("Test object array property type failure", () => {

                expect(() => smokeScreen.fromObject({property: true}, Test))
                    .to.throw(Error);

            });

        });

    });

});

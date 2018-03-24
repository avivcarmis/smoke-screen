import "mocha";
import {expect} from "chai";
import {SmokeScreen} from "../src/SmokeScreen";
import {exposed} from "../src/exposed";
import {PropertyTypes} from "../src/PropertyType";
import EnumPropertyType = PropertyTypes.EnumPropertyType;
import MapPropertyType = PropertyTypes.MapPropertyType;
import SetPropertyType = PropertyTypes.SetPropertyType;

describe("Test property types", () => {

    const smokeScreen = new SmokeScreen();

    describe("Test string property type", () => {

        class Test {

            @exposed({type: String})
            property: string;

            constructor(property: string) {
                this.property = property;
            }

        }

        it("Test serialize", () => {

            const test = new Test("value");
            const result = smokeScreen.toObject(test);
            expect(result.property).to.equal("value");

        });

        it("Test deserialize success", () => {

            const test = smokeScreen.fromObject({property: "value"}, Test);
            expect(test.property).to.equal("value");

        });

        it("Test deserialize failure", () => {

            expect(() => smokeScreen.fromObject({property: true}, Test))
                .to.throw(Error);

        });

    });

    describe("Test number property type", () => {

        class Test {

            @exposed({type: Number})
            property: number;

            constructor(property: number) {
                this.property = property;
            }

        }

        it("Test serialize", () => {

            const test = new Test(12);
            const result = smokeScreen.toObject(test);
            expect(result.property).to.equal(12);

        });

        it("Test deserialize success", () => {

            const test = smokeScreen.fromObject({property: 5}, Test);
            expect(test.property).to.equal(5);

        });

        it("Test deserialize failure", () => {

            expect(() => smokeScreen.fromObject({property: true}, Test))
                .to.throw(Error);

        });

    });

    describe("Test boolean property type", () => {

        class Test {

            @exposed({type: Boolean})
            property: boolean;

            constructor(property: boolean) {
                this.property = property;
            }

        }

        it("Test serialize", () => {

            const test = new Test(true);
            const result = smokeScreen.toObject(test);
            expect(result.property).to.equal(true);

        });

        it("Test deserialize success", () => {

            const test = smokeScreen.fromObject({property: true}, Test);
            expect(test.property).to.equal(true);

        });

        it("Test deserialize failure", () => {

            expect(() => smokeScreen.fromObject({property: "value"}, Test))
                .to.throw(Error);

        });

    });

    describe("Test enum property type", () => {

        enum TestEnum {

            FIRST_VALUE,
            SECOND_VALUE

        }

        describe("Test case-insensitive", () => {

            class Test {

                @exposed({type: TestEnum})
                property: TestEnum;

                constructor(property: TestEnum) {
                    this.property = property;
                }

            }

            it("Test serialize", () => {

                const test = new Test(TestEnum.FIRST_VALUE);
                const result = smokeScreen.toObject(test);
                expect(result.property).to.equal("FIRST_VALUE");

            });

            it("Test deserialize success", () => {

                let test = smokeScreen.fromObject({property: "FIRST_VALUE"}, Test);
                expect(test.property).to.equal(TestEnum.FIRST_VALUE);
                test = smokeScreen.fromObject({property: "second_value"}, Test);
                expect(test.property).to.equal(TestEnum.SECOND_VALUE);

            });

            it("Test deserialize failure", () => {

                expect(() => smokeScreen.fromObject({property: true}, Test))
                    .to.throw(Error);
                expect(() => smokeScreen.fromObject({property: "foo"}, Test))
                    .to.throw(Error);

            });

        });

        describe("Test case-sensitive", () => {

            class Test {

                @exposed({type: new EnumPropertyType(TestEnum, true)})
                property: TestEnum;

                constructor(property: TestEnum) {
                    this.property = property;
                }

            }

            it("Test serialize", () => {

                const test = new Test(TestEnum.FIRST_VALUE);
                const result = smokeScreen.toObject(test);
                expect(result.property).to.equal("FIRST_VALUE");

            });

            it("Test deserialize success", () => {

                const test = smokeScreen.fromObject({property: "FIRST_VALUE"}, Test);
                expect(test.property).to.equal(TestEnum.FIRST_VALUE);

            });

            it("Test deserialize failure", () => {

                expect(() => smokeScreen.fromObject({property: true}, Test))
                    .to.throw(Error);
                expect(() => smokeScreen.fromObject({property: "second_value"}, Test))
                    .to.throw(Error);

            });

        });

    });

    describe("Test object property type", () => {

        class NestedClass {

            @exposed({type: String})
            nestedProperty: string;

            constructor(nestedProperty: string) {
                this.nestedProperty = nestedProperty;
            }

        }

        class Test {

            @exposed({type: NestedClass})
            property: NestedClass;

            constructor(property: NestedClass) {
                this.property = property;
            }

        }

        it("Test serialize", () => {

            const test = new Test(new NestedClass("value"));
            const result = smokeScreen.toObject(test);
            expect(result.property.nestedProperty).to.equal("value");

        });

        it("Test deserialize success", () => {

            const exposure = {property: {nestedProperty: "value"}};
            const test = smokeScreen.fromObject(exposure, Test);
            expect(test.property.nestedProperty).to.equal("value");

        });

        it("Test deserialize failure", () => {

            const exposure = {property: {nestedProperty: false}};
            expect(() => smokeScreen.fromObject(exposure, Test)).to.throw(Error);

        });

    });

    describe("Test map property type", () => {

        class Test {

            @exposed({type: new MapPropertyType(String, String)})
            property: Map<string, string>;

            constructor(property: Map<string, string>) {
                this.property = property;
            }

        }

        it("Test serialize", () => {

            const map = new Map();
            map.set("key", "value");
            const test = new Test(map);
            const result = smokeScreen.toObject(test);
            expect(result.property.key).to.equal("value");

        });

        it("Test deserialize success", () => {

            const exposure = {property: {key1: "value1", key2: "value2"}};
            const test = smokeScreen.fromObject(exposure, Test);
            expect(test.property.size).to.equal(2);
            expect(test.property.has("key1")).to.equal(true);
            expect(test.property.get("key1")).to.equal("value1");
            expect(test.property.has("key2")).to.equal(true);
            expect(test.property.get("key2")).to.equal("value2");

        });

        it("Test deserialize failure", () => {

            const exposure = {property: {key1: false, key2: "value2"}};
            expect(() => smokeScreen.fromObject(exposure, Test)).to.throw(Error);

        });

    });

    describe("Test set property type", () => {

        class Test {

            @exposed({type: new SetPropertyType(String)})
            property: Set<string>;

            constructor(property: Set<string>) {
                this.property = property;
            }

        }

        it("Test serialize", () => {

            const set = new Set();
            set.add("value1");
            set.add("value2");
            const test = new Test(set);
            const result = smokeScreen.toObject(test);
            expect(result.property).to.deep.equal(["value1", "value2"]);

        });

        it("Test deserialize success", () => {

            const exposure = {property: ["value1", "value2", "value1"]};
            const test = smokeScreen.fromObject(exposure, Test);
            expect(test.property.size).to.equal(2);
            expect(test.property.has("value1")).to.equal(true);
            expect(test.property.has("value2")).to.equal(true);

        });

        it("Test deserialize failure", () => {

            const exposure = {property: ["value1", true, "value1"]};
            expect(() => smokeScreen.fromObject(exposure, Test)).to.throw(Error);

        });

    });

    describe("Test array property type", () => {

        describe("Test primitive array property type", () => {

            class Test {

                @exposed({type: [String]})
                property: string[];

                constructor(property: string[]) {
                    this.property = property;
                }

            }

            it("Test serialize", () => {

                const test = new Test(["value1", "value2"]);
                const result = smokeScreen.toObject(test);
                expect(result.property).to.deep.equal(test.property);

            });

            it("Test deserialize success", () => {

                const array = ["value1", "value2"];
                const test = smokeScreen.fromObject({property: array}, Test);
                expect(test.property).to.deep.equal(array);

            });

            it("Test deserialize failure", () => {

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

                constructor(property: TestEnum[]) {
                    this.property = property;
                }

            }

            it("Test serialize", () => {

                const test = new Test([TestEnum.FIRST_VALUE, TestEnum.FIRST_VALUE]);
                const result = smokeScreen.toObject(test);
                expect(result.property).to.deep.equal(["FIRST_VALUE", "FIRST_VALUE"]);

            });

            it("Test deserialize success", () => {

                const array = ["FIRST_VALUE", "SECOND_VALUE"];
                const test = smokeScreen.fromObject({property: array}, Test);
                expect(test.property).to.deep.equal([TestEnum.FIRST_VALUE,
                    TestEnum.SECOND_VALUE]);

            });

            it("Test deserialize failure", () => {

                expect(() => smokeScreen.fromObject({property: true}, Test))
                    .to.throw(Error);

            });

        });

        describe("Test object array property type", () => {

            class NestedClass {

                @exposed({type: String})
                nestedProperty: string;

                constructor(nestedProperty: string) {
                    this.nestedProperty = nestedProperty;
                }

            }

            class Test {

                @exposed({type: [NestedClass]})
                property: NestedClass[];

                constructor(property: NestedClass[]) {
                    this.property = property;
                }

            }

            it("Test serialize", () => {

                const property = [
                    new NestedClass("value1"),
                    new NestedClass("value2")
                ];
                const test = new Test(property);
                const result = smokeScreen.toObject(test);
                expect(result.property).to.deep.equal([
                    {nestedProperty: "value1"},
                    {nestedProperty: "value2"}
                ]);

            });

            it("Test deserialize success", () => {

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

            it("Test deserialize failure", () => {

                expect(() => smokeScreen.fromObject({property: true}, Test))
                    .to.throw(Error);

            });

        });

    });

});

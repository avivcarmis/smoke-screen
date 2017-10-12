import "mocha";
import {expect} from "chai";
import {exposed} from "../src/interfaces";
import {SmokeScreen} from "../src/SmokeScreen";
import {PropertyTypes} from "../src/PropertyTypes";
import * as yamlJS from "yamljs";

describe("Test conversion types", () => {

    class Nested {

        @exposed({type: PropertyTypes.string})
        nestedProperty: string;

        nestedUnexposedProperty: string;

    }

    enum Enum {

        ENUM_VALUE

    }

    class Test {

        @exposed({type: PropertyTypes.string})
        stringProperty: string;

        @exposed({type: PropertyTypes.boolean})
        booleanProperty: boolean;

        @exposed({type: PropertyTypes.number})
        numberProperty: number;

        @exposed({type: PropertyTypes.objectOf(Nested)})
        objectProperty: Nested;

        @exposed({type: PropertyTypes.arrayOf(PropertyTypes.objectOf(Nested))})
        arrayProperty: Nested[];

        @exposed({type: PropertyTypes.enumOf(Enum)})
        enumProperty: Enum;

        unexposedProperty: string;

    }

    const nested1 = new Nested();
    nested1.nestedProperty = "nested 1 value";
    nested1.nestedUnexposedProperty = "nested 1 unexposed value";
    const nested2 = new Nested();
    nested2.nestedProperty = "nested 2 value";
    nested2.nestedUnexposedProperty = "nested 2 unexposed value";
    const nested3 = new Nested();
    nested3.nestedProperty = "nested 3 value";
    nested3.nestedUnexposedProperty = "nested 3 unexposed value";
    const test = new Test();
    test.stringProperty = "value";
    test.booleanProperty = true;
    test.numberProperty = 5.12;
    test.objectProperty = nested1;
    test.arrayProperty = [nested2, nested3];
    test.enumProperty = Enum.ENUM_VALUE;
    test.unexposedProperty = "unexposed value";
    const smokeScreen = new SmokeScreen();

    function testResult(result: any, exposedEnumValue: any) {
        expect(result.stringProperty).to.equal(test.stringProperty);
        expect(result.booleanProperty).to.equal(test.booleanProperty);
        expect(result.numberProperty).to.equal(test.numberProperty);
        expect(result.objectProperty.nestedProperty)
            .to.equal(test.objectProperty.nestedProperty);
        expect(result.objectProperty).to.not.haveOwnProperty("nestedUnexposedProperty");
        expect(result.arrayProperty.length).to.equal(test.arrayProperty.length);
        for (let i = 0; i < test.arrayProperty.length; i++) {
            const testNested = test.arrayProperty[i];
            const resultNested = result.arrayProperty[i];
            expect(resultNested.nestedProperty).to.equal(testNested.nestedProperty);
            expect(resultNested).to.not.haveOwnProperty("nestedUnexposedProperty");
        }
        expect(result.enumProperty).to.equal(exposedEnumValue);
        expect(result).to.not.haveOwnProperty("unexposedProperty");
    }

    it("Test JSON conversion", () => {

        const serialized = smokeScreen.toJSON(test);
        const serializedObject = JSON.parse(serialized);
        testResult(serializedObject, "ENUM_VALUE");
        const deserialized = smokeScreen.fromJSON(serialized, Test);
        testResult(deserialized, test.enumProperty);

    });

    it("Test YAML conversion", () => {

        const serialized = smokeScreen.toYAML(test);
        const serializedObject = yamlJS.parse(serialized);
        testResult(serializedObject, "ENUM_VALUE");
        const deserialized = smokeScreen.fromYAML(serialized, Test);
        testResult(deserialized, test.enumProperty);

    });

    it("Test object conversion", () => {

        const serialized = smokeScreen.toObject(test);
        testResult(serialized, "ENUM_VALUE");
        const deserialized = smokeScreen.fromObject(serialized, Test);
        testResult(deserialized, test.enumProperty);

    });

});

import "mocha";
import {expect} from "chai";
import {SmokeScreen} from "../src/SmokeScreen";
import * as yamlJS from "yamljs";
import {exposed} from "../src/exposed";

describe("Test conversion types", () => {

    class Nested {

        @exposed({type: String})
        nestedProperty: string;

        nestedUnexposedProperty: string;

        constructor(nestedProperty: string, nestedUnexposedProperty: string) {
            this.nestedProperty = nestedProperty;
            this.nestedUnexposedProperty = nestedUnexposedProperty;
        }

    }

    enum Enum {

        ENUM_VALUE

    }

    class Test {

        @exposed({type: String})
        stringProperty: string;

        @exposed({type: Boolean})
        booleanProperty: boolean;

        @exposed({type: Number})
        numberProperty: number;

        @exposed({type: Nested})
        objectProperty: Nested;

        @exposed({type: [Nested]})
        arrayProperty: Nested[];

        @exposed({type: Enum})
        enumProperty: Enum;

        unexposedProperty: string;

        constructor(stringProperty: string, booleanProperty: boolean,
                    numberProperty: number, objectProperty: Nested,
                    arrayProperty: Nested[], enumProperty: Enum,
                    unexposedProperty: string) {
            this.stringProperty = stringProperty;
            this.booleanProperty = booleanProperty;
            this.numberProperty = numberProperty;
            this.objectProperty = objectProperty;
            this.arrayProperty = arrayProperty;
            this.enumProperty = enumProperty;
            this.unexposedProperty = unexposedProperty;
        }

    }

    const nested1 = new Nested("nested 1 value", "nested 1 unexposed value");
    const nested2 = new Nested("nested 2 value", "nested 2 unexposed value");
    const nested3 = new Nested("nested 3 value", "nested 3 unexposed value");
    const test = new Test(
        "value",
        true,
        5.12, nested1,
        [nested2, nested3],
        Enum.ENUM_VALUE,
        "unexposed value"
    );
    const smokeScreen = new SmokeScreen();

    function testResult(result: any, exposedEnumValue: any) {
        expect(result.stringProperty).to.equal(test.stringProperty);
        expect(result.booleanProperty).to.equal(test.booleanProperty);
        expect(result.numberProperty).to.equal(test.numberProperty);
        expect(result.objectProperty.nestedProperty)
            .to.equal(test.objectProperty.nestedProperty);
        expect(typeof result.objectProperty.nestedUnexposedProperty).to.equal("undefined");
        expect(result.arrayProperty.length).to.equal(test.arrayProperty.length);
        for (let i = 0; i < test.arrayProperty.length; i++) {
            const testNested = test.arrayProperty[i];
            const resultNested = result.arrayProperty[i];
            expect(resultNested.nestedProperty).to.equal(testNested.nestedProperty);
            expect(typeof resultNested.nestedUnexposedProperty).to.equal("undefined");
        }
        expect(result.enumProperty).to.equal(exposedEnumValue);
        expect(typeof result.unexposedProperty).to.equal("undefined");
    }

    it("Test JSON conversion", () => {

        const serialized = smokeScreen.toJSON(test);
        const serializedObject = JSON.parse(serialized);
        testResult(serializedObject, "ENUM_VALUE");
        const deserialized = smokeScreen.fromJSON(serialized, Test);
        testResult(deserialized, test.enumProperty);
        const instance = new (Test as any)();
        smokeScreen.updateFromJSON(serialized, instance);
        testResult(instance, test.enumProperty);

    });

    it("Test YAML conversion", () => {

        const serialized = smokeScreen.toYAML(test);
        const serializedObject = yamlJS.parse(serialized);
        testResult(serializedObject, "ENUM_VALUE");
        const deserialized = smokeScreen.fromYAML(serialized, Test);
        testResult(deserialized, test.enumProperty);
        const instance = new (Test as any)();
        smokeScreen.updateFromYAML(serialized, instance);
        testResult(instance, test.enumProperty);

    });

    it("Test object conversion", () => {

        const serialized = smokeScreen.toObject(test);
        testResult(serialized, "ENUM_VALUE");
        const deserialized = smokeScreen.fromObject(serialized, Test);
        testResult(deserialized, test.enumProperty);
        const instance = new (Test as any)();
        smokeScreen.updateFromObject(serialized, instance);
        testResult(instance, test.enumProperty);

    });

});

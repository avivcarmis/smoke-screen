import "mocha";
import {expect} from "chai";
import {SmokeScreen} from "../src/SmokeScreen";
import {exposed} from "../src/Exposed";
import {NamingTranslator, NamingTranslators} from "../src/NamingTranslator";

describe("Test all naming translators", () => {

    class Test {

        @exposed
        camelCase = "value";

        @exposed
        _camelCaseWithPrefix = "value";

        @exposed
        camelCaseWithABBRSequence = "value";

        @exposed
        UpperCamelCase = "value";

        @exposed
        snake_case = "value";

        @exposed
        UPPER_SNAKE_CASE = "value";

    }

    const test = new Test();

    function testTranslator(translator: NamingTranslator, ...requiredFields: string[]) {
        const smokeScreen = new SmokeScreen(translator);
        const exposure = smokeScreen.toObject(test);
        for (const field of requiredFields) {
            expect(exposure[field]).to.equal("value", field);
        }
    }

    it("Test upper camel case", () => {

        testTranslator(NamingTranslators.upperCamelCase,
            "CamelCase",
            "CamelCaseWithPrefix",
            "CamelCaseWithABBRSequence",
            "UpperCamelCase",
            "SnakeCase",
            "UpperSnakeCase"
        );

    });

    it("Test lower snake case", () => {

        testTranslator(NamingTranslators.lowerSnakeCase,
            "camel_case",
            "camel_case_with_prefix",
            "camel_case_with_abbr_sequence",
            "upper_camel_case",
            "snake_case",
            "upper_snake_case"
        );

    });

    it("Test upper snake case", () => {

        testTranslator(NamingTranslators.upperSnakeCase,
            "CAMEL_CASE",
            "CAMEL_CASE_WITH_PREFIX",
            "CAMEL_CASE_WITH_ABBR_SEQUENCE",
            "UPPER_CAMEL_CASE",
            "SNAKE_CASE",
            "UPPER_SNAKE_CASE"
        );

    });

    it("Test lower kebab case", () => {

        testTranslator(NamingTranslators.lowerKebabCase,
            "camel-case",
            "camel-case-with-prefix",
            "camel-case-with-abbr-sequence",
            "upper-camel-case",
            "snake-case",
            "upper-snake-case"
        );

    });

    it("Test upper kebab case", () => {

        testTranslator(NamingTranslators.upperKebabCase,
            "CAMEL-CASE",
            "CAMEL-CASE-WITH-PREFIX",
            "CAMEL-CASE-WITH-ABBR-SEQUENCE",
            "UPPER-CAMEL-CASE",
            "SNAKE-CASE",
            "UPPER-SNAKE-CASE"
        );

    });

});

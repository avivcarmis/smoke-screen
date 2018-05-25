import "mocha";
import {SmokeScreen} from "../src/SmokeScreen";
import {exposed} from "../src/exposed";

describe("Test edge cases", () => {

    it("Test nested null pointer", () => {

        class Nested {}

        class Root {

            @exposed({type: Nested, nullable: true})
            nested: Nested | null;

            constructor(nested: Nested | null) {
                this.nested = nested;
            }

        }

        const root = new Root(null);
        const smokeScreen = new SmokeScreen();
        smokeScreen.toObject(root);

    });

});

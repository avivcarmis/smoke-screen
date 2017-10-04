import * as to from "to-case";
import {NamingTranslator} from "./interfaces";

export namespace NamingTranslators {

    export abstract class ToCaseBasedTranslator implements NamingTranslator {

        constructor(private readonly _translator: (input: string) => string) {
        }

        translate(propertyName: string): string {
            // first, normalize sequences of uppercase to prevent
            // separating 'myXMLParser' to 'my_x_m_l_parser'
            // rather than 'my_xml_parser
            let normalized = "";
            let upperSequence = "";
            for (const c of propertyName) {
                if (c !== c.toLowerCase()) {
                    // upper case
                    upperSequence += c;
                }
                else {
                    if (upperSequence.length === 1) {
                        normalized += upperSequence;
                        upperSequence = "";
                    }
                    else if (upperSequence.length > 1) {
                        // finished upper sequence
                        normalized += upperSequence
                            .charAt(0).toUpperCase();
                        normalized += upperSequence
                            .substr(1, upperSequence.length - 2).toLowerCase();
                        normalized += upperSequence
                            .charAt(upperSequence.length - 1).toUpperCase();
                        upperSequence = ""
                    }
                    normalized += c;
                }
            }
            // now translate
            return this._translator(normalized);
        }

    }

    export class UpperCamelCaseTranslator extends ToCaseBasedTranslator {

        constructor() {
            super(to.pascal);
        }

    }

    export class LowerSnakeCaseTranslator extends ToCaseBasedTranslator {

        constructor() {
            super(to.snake);
        }

    }

    export class UpperSnakeCaseTranslator extends ToCaseBasedTranslator {

        constructor() {
            super(to.constant);
        }

    }

    export class LowerKebabCaseTranslator extends ToCaseBasedTranslator {

        constructor() {
            super(to.slug);
        }

    }

    export class UpperKebabCaseTranslator extends ToCaseBasedTranslator {

        constructor() {
            super(s => to.slug(s).toUpperCase());
        }

    }

}
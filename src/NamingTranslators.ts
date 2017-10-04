import * as to from "to-case";

export namespace NamingTranslators {
    
    function constructByToCase(toCaseFunction: (input: string) => string) {
        return (propertyName: string) => {
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
            return toCaseFunction(normalized);
        };
    }

    export const upperCamelCaseTranslator = constructByToCase(to.pascal);

    export const lowerSnakeCaseTranslator = constructByToCase(to.snake);

    export const upperSnakeCaseTranslator = constructByToCase(to.constant);

    export const lowerKebabCaseTranslator = constructByToCase(to.slug);

    export const upperKebabCaseTranslator = constructByToCase(s =>
        to.slug(s).toUpperCase());

}
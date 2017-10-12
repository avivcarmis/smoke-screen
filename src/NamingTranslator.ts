import * as to from "to-case";

export type NamingTranslator = (propertyName: string) => string;

export namespace NamingTranslators {

    type ToCase = (input: string) => string;

    function constructByToCase(toCaseFunction: ToCase, preserveCase: boolean) {
        return (propertyName: string) => {
            // remove $ or _ from the start
            propertyName = propertyName.replace(/^([_$])*/, "");
            if (!preserveCase) {
                // if output should preserve the original case, we want to
                // normalize sequences of uppercase letters to prevent
                // separating 'myXMLParser' to 'my_x_m_l_parser'
                // rather than 'my_xml_parser
                propertyName = propertyName
                    .replace(/([a-z])([A-Z])/g, "$1 $2")
                    .replace(/([A-Z])([a-z])/g, " $1$2")
                    .split(" ")
                    .map(s => s.charAt(0).toUpperCase() +
                        s.substr(1).toLowerCase())
                    .join("");
            }
            return toCaseFunction(propertyName);
        };
    }

    export const upperCamelCase = constructByToCase(to.pascal, true);

    export const lowerSnakeCase = constructByToCase(to.snake, false);

    export const upperSnakeCase = constructByToCase(to.constant, false);

    export const lowerKebabCase = constructByToCase(to.slug, false);

    export const upperKebabCase = constructByToCase(s =>
        to.slug(s).toUpperCase(), false);

}

import {ReflectionMetadata} from "./ReflectionMetadata";
import {SmokeScreen} from "./SmokeScreen";

export type NamingTranslator = (propertyName: string) => string;

export interface PropertyType {

    translateOutput(smokeScreen: SmokeScreen, value: any): any;

    translateInput(smokeScreen: SmokeScreen, value: any): any;

}

export interface ExposureSettings {

    as?: string;

    type?: PropertyType | Constructable<any>;

    validator?: (value: any) => any;

}

export interface Constructable<T> {

    new(): T;

}

export function isConstructable(object: any): object is Constructable<any> {
    return typeof object === 'function'
        && /^class\s/.test(Function.prototype.toString.call(object));
}

export function exposed(target: any, propertyKey: string): void;
export function exposed(settings?: ExposureSettings): (target: any,
                                                       propertyKey: string) => void;
export function exposed(a: any, b?: string): any {
    function getDecorator(settings: ExposureSettings) {
        return (target: any, propertyKey: string) => {
            const reflectionMetadata = ReflectionMetadata.extract(target);
            reflectionMetadata.addProperty(propertyKey, settings);
        };
    }
    if (b) {
        getDecorator({})(a, b);
    }
    else {
        return getDecorator(a || {});
    }
}
import {ReflectionMetadata} from "./ReflectionMetadata";

export interface Type {

    validate(value: any): any;

}

export interface NamingTranslator {

    translate(propertyName: string): string;

}

export interface ExposureSettings {

    as?: string;

    type?: Type | Constructable<any>;

    validator?: (value: any) => any;

}

export interface Constructable<T> {

    new(): T;

}

export function exposed(settings: ExposureSettings = {}) {
    return (target: any, propertyKey: string) => {
        const reflectionMetadata = ReflectionMetadata.extract(target);
        reflectionMetadata.addProperty(propertyKey, settings);
    };
}

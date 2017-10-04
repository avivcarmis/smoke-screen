import {ReflectionMetadata} from "./ReflectionMetadata";

export type NamingTranslator = (propertyName: string) => string;

export interface PropertyType {

    translateOutput(value: any): any;

    translateInput(value: any): any;

}

export interface ExposureSettings {

    as?: string;

    type?: PropertyType | Constructable<any>;

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

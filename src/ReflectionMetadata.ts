import {ExposureSettings} from "./interfaces";

export class ReflectionMetadata {

    static extract(target: any) {
        if (!target[ReflectionMetadata.STORAGE_KEY]) {
            target[ReflectionMetadata.STORAGE_KEY] = new ReflectionMetadata();
        }
        return (target[ReflectionMetadata.STORAGE_KEY] as ReflectionMetadata);
    }

    private static readonly STORAGE_KEY = "__reflection_metadata";

    private readonly _properties: {[key: string]: ExposureSettings} = {};

    // private readonly _constructorParams = {};

    addProperty(key: string, settings: ExposureSettings) {
        this._properties[key] = settings;
    }

    getProperty(key: string) {
        return this._properties[key];
    }

    getPropertyKeys() {
        return Object.keys(this._properties);
    }

}
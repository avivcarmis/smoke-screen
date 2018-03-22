import {ExposureSettings} from "./ExposureSettings";

/**
 * Holds exposure information regarding class properties.
 */
export class ReflectionService {

    private static readonly STORAGE_KEY = "__reflection_metadata";

    private readonly _properties: {[key: string]: ExposureSettings} = {};

    addProperty(key: string, settings: ExposureSettings) {
        this._properties[key] = settings;
    }

    getProperty(key: string) {
        return this._properties[key];
    }

    getPropertyKeys() {
        return Object.keys(this._properties);
    }

    static extract(target: any) {
        if (!target[ReflectionService.STORAGE_KEY]) {
            target[ReflectionService.STORAGE_KEY] = new ReflectionService();
        }
        return (target[ReflectionService.STORAGE_KEY] as ReflectionService);
    }

}

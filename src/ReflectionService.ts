import {ExposureSettings} from "./ExposureSettings";

const STORAGE_KEY = "__smoke_screen_reflection_service";

/**
 * Holds exposure information regarding class properties.
 */
export class ReflectionService {

    private readonly _parent: ReflectionService | null;

    private readonly _properties: {[key: string]: ExposureSettings};

    constructor(parent: ReflectionService | null = null) {
        this._parent = parent;
        this._properties = {};
    }

    addProperty(key: string, settings: ExposureSettings) {
        this._properties[key] = settings;
    }

    getProperty(key: string): ExposureSettings | undefined {
        let result: ExposureSettings | undefined = this._properties[key];
        if (!result) {
            if (this._parent) {
                result = this._parent.getProperty(key);
            }
        }
        return result;
    }

    getPropertyKeys(): string[] {
        const inheritedKeys: string[] = this._parent ? this._parent.getPropertyKeys() : [];
        return [...inheritedKeys, ...Object.keys(this._properties)];
    }

    static forClass(target: any) {
        if (Object.getOwnPropertyDescriptor(target, STORAGE_KEY) == null) {
            // not yet created
            if (target[STORAGE_KEY]) {
                // inherits from parent
                target[STORAGE_KEY] = new ReflectionService(target[STORAGE_KEY]);
            } else {
                target[STORAGE_KEY] = new ReflectionService();
            }
        }
        return target[STORAGE_KEY] as ReflectionService;
    }

}

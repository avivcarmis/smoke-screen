import {Constructable} from "./Constructable";
import {ReflectionService} from "./ReflectionService";
import {ExposureSettings} from "./ExposureSettings";
import {NamingTranslator} from "./NamingTranslator";
import {parseShortPropertyType, safeDeserialize, safeSerialize} from "./PropertyType";
import {instanceOfSmokeScreenLifecycle} from "./SmokeScreenLifecycle";

/**
 * The main module interface.
 * A SmokeScreen instance may be used to serialize and deserialize
 * from various object representations.
 */
export class SmokeScreen {

    /**
     * @param {NamingTranslator} namingTranslator   may be used to set an automatic
     *                                              naming translator for the instance,
     *                                              which will be used to auto-translate
     *                                              all property names
     */
    constructor(private readonly namingTranslator: NamingTranslator | null = null) {}

    /**
     * Serializes the given object to a JSON string.
     * Filtering properties and translating property names and their values if needed.
     * @param object        object to serialize
     * @returns {string}    the resulted JSON
     */
    toJSON(object: any) {
        return JSON.stringify(this.toObject(object));
    }

    /**
     * Deserializes the given JSON string into a fresh instance of the given class and
     * returns it. Filtering properties, validates and translates the property names and
     * their values if needed. throws an Error in case of invalid input.
     * @param {string} json                     string to deserialize
     * @param {Constructable<T>} instanceClass  class to deserialize into
     * @returns {T}                             the resulted instance
     */
    fromJSON<T>(json: string, instanceClass: Constructable<T>): T {
        return this.fromObject(JSON.parse(json), instanceClass);
    }

    /**
     * Deserializes the given JSON string into the given instance. Filtering properties,
     * validates and translates the property names and their values if needed.
     * throws an Error in case of invalid input.
     * @param {string} json                     string to deserialize
     * @param {Constructable<T>} instanceClass  class to deserialize into
     * @returns {T}                             the resulted instance
     */
    updateFromJSON<T>(json: string, instance: T) {
        this.updateFromObject(JSON.parse(json), instance);
    }

    /**
     * Serializes the given object to a generic JS object containing the exposure.
     * Filtering properties and translating property names and their values if needed.
     * @param object                    object to serialize
     * @returns {{[p: string]: any}}    the resulted generic object
     */
    toObject(object: any): {[key: string]: any} {
        if (instanceOfSmokeScreenLifecycle(object) && object.beforeSerialize) {
            object.beforeSerialize();
        }
        const exposure: any = {};
        const reflectionService = ReflectionService.forClass(object);
        if (reflectionService) {
            for (const key of Object.keys(object)) {
                const exposureSettings = reflectionService.getProperty(key);
                if (!exposureSettings) {
                    continue;
                }
                let value = object[key];
                if (exposureSettings.type) {
                    const type = parseShortPropertyType(exposureSettings.type);
                    value = safeSerialize(type, this, value);
                }
                const externalName = this.translate(key, exposureSettings);
                exposure[externalName] = value;
            }
        }
        return exposure;
    }

    /**
     * Deserializes the given generic JS object into a fresh instance of the given class
     * and returns it. Filtering properties, validates and translates the property names
     * and their values if needed. throws an Error in case of invalid input.
     * @param {{[p: string]: any}} exposure     object to deserialize
     * @param {Constructable<T>} instanceClass  class to deserialize into
     * @returns {T}                             the resulted instance
     */
    fromObject<T>(exposure: {[key: string]: any}, instanceClass: Constructable<T>) {
        const instance = new instanceClass();
        this.updateFromObject(exposure, instance);
        return instance;
    }

    /**
     * Deserializes the given generic JS object into the given instance.
     * Filtering properties, validates and translates the property names and their values
     * if needed. throws an Error in case of invalid input.
     * @param {{[p: string]: any}} exposure
     * @param {T} instance
     */
    updateFromObject<T>(exposure: {[key: string]: any}, instance: T) {
        const errors = [];
        const reflectionService = ReflectionService.forClass(instance);
        if (reflectionService) {
            for (const key of reflectionService.getPropertyKeys()) {
                const exposureSettings = reflectionService.getProperty(key);
                if (!exposureSettings) {
                    continue;
                }
                const externalName = this.translate(key, exposureSettings);
                let value = exposure[externalName];
                if (typeof value === "undefined") {
                    if (!exposureSettings.optional) {
                        errors.push(`property '${externalName}' is required`);
                    }
                    continue;
                }
                if (value === null) {
                    if (exposureSettings.nullable) {
                        (instance as any)[key] = null;
                    } else {
                        errors.push(`property '${externalName}' may not be null`);
                    }
                    continue;
                }
                if (exposureSettings.type) {
                    const type = parseShortPropertyType(exposureSettings.type);
                    try {
                        value = safeDeserialize(type, this, value);
                    } catch (e) {
                        errors.push(`property '${externalName}' ${e.message}`);
                        continue;
                    }
                }
                if (exposureSettings.validator) {
                    try {
                        const translated = exposureSettings.validator(value);
                        if (typeof translated !== "undefined") {
                            value = translated;
                        }
                    } catch (e) {
                        errors.push(`property '${externalName}' ${e.message}`);
                        continue;
                    }
                }
                (instance as any)[key] = value;
            }
            if (errors.length > 0) {
                throw new Error(`illegal input - ${errors.join("; ")}`);
            }
        }
        if (instanceOfSmokeScreenLifecycle(instance) && (instance as any).afterDeserialize) {
            (instance as any).afterDeserialize();
        }
    }

    private translate(key: string, exposureSettings: ExposureSettings) {
        if (exposureSettings.as) {
            return exposureSettings.as;
        }
        if (this.namingTranslator) {
            return this.namingTranslator(key);
        }
        return key;
    }

}

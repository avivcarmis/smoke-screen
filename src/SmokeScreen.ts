import {Constructable} from "./Constructable";
import {ReflectionMetadata} from "./ReflectionMetadata";
import * as yamlJS from "yamljs";
import {ExposureSettings} from "./Exposed";
import {NamingTranslator} from "./NamingTranslator";

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
     * Translates the property names and their values if needed.
     * @param object        object to serialize
     * @returns {string}    the resulted JSON
     */
    toJSON(object: any) {
        return JSON.stringify(this.toObject(object));
    }

    /**
     * Deserializes the given JSON string into an instance of the given class.
     * Validates and translates the property names and their values if needed.
     * @param {string} json                     string to deserialize
     * @param {Constructable<T>} instanceClass  class to deserialize into
     * @returns {T}                             the resulted instance
     */
    fromJSON<T>(json: string, instanceClass: Constructable<T>): T {
        return this.fromObject(JSON.parse(json), instanceClass);
    }

    /**
     * Serializes the given object to a YAML string.
     * Translates the property names and their values if needed.
     * @param object        object to serialize
     * @returns {string}    the resulted YAML
     */
    toYAML(object: any) {
        return yamlJS.stringify(this.toObject(object));
    }

    /**
     * Deserializes the given YAML string into an instance of the given class.
     * Validates and translates the property names and their values if needed.
     * @param {string} yaml                     YAML to deserialize
     * @param {Constructable<T>} instanceClass  class to deserialize into
     * @returns {T}                             the resulted instance
     */
    fromYAML<T>(yaml: string, instanceClass: Constructable<T>): T {
        return this.fromObject(yamlJS.parse(yaml), instanceClass);
    }

    /**
     * Serializes the given object to a generic JS object.
     * Translates the property names and their values if needed.
     * @param object                    object to serialize
     * @returns {{[p: string]: any}}    the resulted generic object
     */
    toObject(object: any): {[key: string]: any} {
        const exposure: any = {};
        const reflectionMetadata = ReflectionMetadata.extract(object);
        if (reflectionMetadata) {
            for (const key of Object.keys(object)) {
                const exposureSettings = reflectionMetadata.getProperty(key);
                if (!exposureSettings) {
                    continue;
                }
                let value = object[key];
                if (exposureSettings.type) {
                    const translated = exposureSettings.type.serialize(this, value);
                    if (typeof translated !== "undefined") {
                        value = translated;
                    }
                }
                const externalName = this.translate(key, exposureSettings);
                exposure[externalName] = value;
            }
        }
        return exposure;
    }

    /**
     * Deserializes the given generic JS object into an instance of the given class.
     * Validates and translates the property names and their values if needed.
     * @param {{[p: string]: any}} exposure     object to deserialize
     * @param {Constructable<T>} instanceClass  class to deserialize into
     * @returns {T}                             the resulted instance
     */
    fromObject<T>(exposure: {[key: string]: any}, instanceClass: Constructable<T>) {
        const errors = [];
        const instance = new instanceClass();
        const reflectionMetadata = ReflectionMetadata.extract(instance);
        if (reflectionMetadata) {
            for (const key of reflectionMetadata.getPropertyKeys()) {
                const exposureSettings = reflectionMetadata.getProperty(key);
                if (!exposureSettings) {
                    continue;
                }
                const externalName = this.translate(key, exposureSettings);
                let value = exposure[externalName];
                if (typeof value === "undefined") {
                    if (exposureSettings.defaultValue) {
                        value = exposureSettings.defaultValue;
                    } else {
                        errors.push(`property '${externalName}' is missing missing`);
                        continue;
                    }
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
                    try {
                        const translated =
                            exposureSettings.type.deserialize(this, value);
                        if (typeof translated !== "undefined") {
                            value = translated;
                        }
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
                throw new Error(`illegal json - ${errors.join("; ")}`);
            }
        }
        return instance;
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

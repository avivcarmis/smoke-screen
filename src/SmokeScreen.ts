import {Constructable, ExposureSettings, NamingTranslator} from "./interfaces";
import {ReflectionMetadata} from "./ReflectionMetadata";
import * as yamlJS from "yamljs";

export class SmokeScreen {

    constructor(private readonly namingTranslator: NamingTranslator | null = null) {}

    toJSON(object: any) {
        return JSON.stringify(this.toObject(object));
    }

    fromJSON<T>(json: string, instanceClass: Constructable<T>): T {
        return this.fromObject(JSON.parse(json), instanceClass);
    }

    toYAML(object: any) {
        return yamlJS.stringify(this.toObject(object));
    }

    fromYAML<T>(yaml: string, instanceClass: Constructable<T>): T {
        return this.fromObject(yamlJS.parse(yaml), instanceClass);
    }

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
                    const translated = exposureSettings.type.translateOutput(this, value);
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
                            exposureSettings.type.translateInput(this, value);
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

import {Constructable, ExposureSettings, NamingTranslator} from "./interfaces";
import {ReflectionMetadata} from "./ReflectionMetadata";

function isConstructable(object: any): object is Constructable<any> {
    return typeof object === 'function'
        && /^class\s/.test(Function.prototype.toString.call(object));
}

export class SmokeScreen {

    constructor(private readonly namingTranslator: NamingTranslator | null = null) {}

    toJSON(object: any) {
        return JSON.stringify(this.toObject(object));
    }

    fromJSON<T>(json: string, instanceClass: Constructable<T>) {
        return this.fromObject(JSON.parse(json), instanceClass);
    }

    toObject(object: {[key: string]: any}) {
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
                    if (isConstructable(exposureSettings.type)) {
                        value = this.toObject(value);
                    }
                    else {
                        value = exposureSettings.type.translateOutput(value);
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
        const instance = new instanceClass(); // TODO lookup params
        const reflectionMetadata = ReflectionMetadata.extract(instance);
        if (reflectionMetadata) {
            for (const key of reflectionMetadata.getPropertyKeys()) {
                const exposureSettings = reflectionMetadata.getProperty(key);
                if (!exposureSettings) {
                    continue;
                }
                const externalName = this.translate(key, exposureSettings);
                let value = exposure[externalName];
                if (value === null || typeof value === "undefined") {
                    errors.push(`property '${externalName}' is missing missing`);
                    continue;
                }
                if (exposureSettings.type) {
                    try {
                        if (isConstructable(exposureSettings.type)) {
                            value = this.fromObject(value, exposureSettings.type);
                        }
                        else {
                            value = exposureSettings.type.translateInput(value);
                        }
                    } catch (e) {
                        errors.push(`property '${externalName}' ${e.message}`);
                        continue;
                    }
                }
                if (exposureSettings.validator) {
                    try {
                        value = exposureSettings.validator(value);
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

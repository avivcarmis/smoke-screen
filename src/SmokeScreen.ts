import {Constructable, Type} from "./interfaces";
import {ReflectionMetadata} from "./ReflectionMetadata";

function instanceOfType(object: any): object is Type {
    return typeof object.validate == "function";
}

export class SmokeScreen {

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
                const externalName = exposureSettings.as ? exposureSettings.as : key;
                let value = object[key];
                if (exposureSettings.type && !instanceOfType(exposureSettings.type)) {
                    value = this.toObject(value);
                }
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
                const externalName = exposureSettings.as ? exposureSettings.as : key;
                let value = exposure[externalName];
                if (value === null || typeof value === "undefined") {
                    errors.push(`property '${externalName}' is missing missing`);
                    continue;
                }
                if (exposureSettings.type) {
                    try {
                        if (instanceOfType(exposureSettings.type)) {
                            value = exposureSettings.type.validate(value);
                        }
                        else {
                            value = this.fromObject(value, exposureSettings.type);
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

}

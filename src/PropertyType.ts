import {SmokeScreen} from "./SmokeScreen";
import {Constructable} from "./Constructable";
import {EnumClass} from "./EnumClass";

/**
 * Performs both validation and value translation on both
 * serialization and deserialization.
 */
export interface PropertyType {

    /**
     * Performs validation of value if needed, and translation of value
     * if needed, when serializing a property.
     *
     * Validation may be performed by inspecting the input value parameter,
     * if the value is invalid, the function should throw an error describing
     * the invalidity.
     *
     * Translation may be performed by returning a value different than the
     * given one. Skipping translation may be performed by simply not
     * returning any value from the function, or by returning the given one.
     *
     * @param {SmokeScreen} smokeScreen instance performing the current serialization
     * @param value                     value to inspect
     * @returns {any}                   translated value
     */
    serialize(smokeScreen: SmokeScreen, value: any): any;

    /**
     * Performs validation of value if needed, and translation of value
     * if needed, when deserializing a property.
     *
     * Validation may be performed by inspecting the input value parameter,
     * if the value is invalid, the function should throw an error describing
     * the invalidity.
     *
     * Translation may be performed by returning a value different than the
     * given one. Skipping translation may be performed by simply not
     * returning any value from the function, or by returning the given one.
     *
     * @param {SmokeScreen} smokeScreen instance performing the current deserialization
     * @param value                     value to inspect
     * @returns {any}                   translated value
     */
    deserialize(smokeScreen: SmokeScreen, value: any): any;

}

/**
 * Out of the box set of common property type implementations
 */
export namespace PropertyTypes {

    export class StringPropertyType implements PropertyType {

        serialize(_smokeScreen: SmokeScreen, _value: any): any {
            return;
        }

        deserialize(_smokeScreen: SmokeScreen, value: any): any {
            if (typeof value !== "string") {
                throw new Error("must be a string");
            }
        }

    }

    export class NumberPropertyType implements PropertyType {

        serialize(_smokeScreen: SmokeScreen, _value: any): any {
            return;
        }

        deserialize(_smokeScreen: SmokeScreen, value: any): any {
            if (typeof value !== "number") {
                throw new Error("must be a number");
            }
        }

    }

    export class BooleanPropertyType implements PropertyType {

        serialize(_smokeScreen: SmokeScreen, _value: any): any {
            return;
        }

        deserialize(_smokeScreen: SmokeScreen, value: any): any {
            if (typeof value !== "boolean") {
                throw new Error("must be a boolean");
            }
        }

    }

    export class EnumPropertyType<T extends EnumClass> implements PropertyType {

        constructor(private readonly _enumClass: T,
                    private readonly _caseSensitive = false) {
        }

        serialize(_smokeScreen: SmokeScreen, value: any): any {
            return (this._enumClass as any)[value];
        }

        deserialize(_smokeScreen: SmokeScreen, value: any): any {
            if (this._caseSensitive) {
                const result = (this._enumClass as any)[value];
                if (typeof result !== "undefined") {
                    return result;
                }
            } else {
                for (const key of this.getAllKeys()) {
                    if (key.toLowerCase() === value.trim().toLowerCase()) {
                        return (this._enumClass as any)[key];
                    }
                }
            }
            throw new Error(`must be one of [${this.getAllKeys().join(", ")}]`);
        }

        private getAllKeys() {
            const result = [];
            for (const key of Object.keys(this._enumClass)) {
                if (isNaN(Number(key))) {
                    result.push(key);
                }
            }
            return result;
        }

    }

    export class ArrayPropertyType implements PropertyType {

        private readonly _itemType: PropertyType;

        constructor(itemType: ShortPropertyType) {
            this._itemType = parseShortPropertyType(itemType);
        }

        serialize(smokeScreen: SmokeScreen, value: any): any {
            if (!(value instanceof Array)) {
                return value;
            }
            const result = [];
            for (const item of value) {
                result.push(safeSerialize(this._itemType, smokeScreen, item));
            }
            return result;
        }

        deserialize(smokeScreen: SmokeScreen, value: any): any {
            if (!(value instanceof Array)) {
                throw new Error("must be an array");
            }
            const result = [];
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                try {
                    result.push(safeDeserialize(this._itemType, smokeScreen, item));
                } catch (e) {
                    throw new Error(`item ${i} of the array ${e.message}`);
                }
            }
            return result;
        }

    }

    export class MapPropertyType implements PropertyType {

        private readonly _keyType: PropertyType;

        private readonly _valueType: PropertyType;

        constructor(keyType: ShortPropertyType, valueType: ShortPropertyType) {
            this._keyType = parseShortPropertyType(keyType);
            this._valueType = parseShortPropertyType(valueType);
        }

        serialize(smokeScreen: SmokeScreen, value: any): any {
            if (!(value instanceof Map)) {
                throw new Error("must be a Map object");
            }
            const exposure: any = {};
            for (const key of value.keys()) {
                const exposedKey = safeSerialize(this._keyType, smokeScreen, key);
                exposure[exposedKey] = safeSerialize(this._valueType, smokeScreen, value.get(key));
            }
            return exposure;
        }

        deserialize(smokeScreen: SmokeScreen, value: any): any {
            if (typeof value != "object") {
                throw new Error("must be an object");
            }
            const result = new Map();
            for (const key of Object.keys(value)) {
                try {
                    const internalKey = safeDeserialize(this._keyType, smokeScreen, key);
                    const internalValue = safeDeserialize(this._valueType, smokeScreen, value[key]);
                    result.set(internalKey, internalValue);
                } catch (e) {
                    throw new Error(`key ${key} of the map ${e.message}`);
                }
            }
            return result;
        }

    }

    export class SetPropertyType implements PropertyType {

        private readonly _itemType: PropertyType;

        constructor(itemType: ShortPropertyType) {
            this._itemType = parseShortPropertyType(itemType);
        }

        serialize(smokeScreen: SmokeScreen, value: any): any {
            if (!(value instanceof Set)) {
                throw new Error("must be a Set object");
            }
            const exposure = [];
            for (const item of value) {
                exposure.push(safeSerialize(this._itemType, smokeScreen, item));
            }
            return exposure;
        }

        deserialize(smokeScreen: SmokeScreen, value: any): any {
            if (!(value instanceof Array)) {
                throw new Error("must be an array");
            }
            const result = new Set();
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                try {
                    result.add(safeDeserialize(this._itemType, smokeScreen, item));
                } catch (e) {
                    throw new Error(`item ${i} of the array ${e.message}`);
                }
            }
            return result;
        }

    }

    export class ObjectPropertyType<T> implements PropertyType {

        constructor(private readonly _objectClass: Constructable<T>) {}

        serialize(smokeScreen: SmokeScreen, value: any): any {
            return smokeScreen.toObject(value);
        }

        deserialize(smokeScreen: SmokeScreen, value: any): any {
            return smokeScreen.fromObject(value, this._objectClass);
        }

    }

}

export type ShortSingleType =
    StringConstructor |
    NumberConstructor |
    BooleanConstructor |
    Constructable<any> |
    EnumClass |
    PropertyType;
export type ShortPropertyType = ShortSingleType | [ShortSingleType];

function instanceofPropertyType(type: ShortPropertyType): type is PropertyType {
    return typeof type == "object" &&
        (type as any).serialize &&
        (type as any).deserialize;
}

export function parseShortPropertyType(type: ShortPropertyType): PropertyType {
    if (type instanceof Array) {
        const itemType = type[0];
        return new PropertyTypes.ArrayPropertyType(parseShortPropertyType(itemType));
    }
    if (type == String) {
        return new PropertyTypes.StringPropertyType();
    }
    if (type == Boolean) {
        return new PropertyTypes.BooleanPropertyType();
    }
    if (type == Number) {
        return new PropertyTypes.NumberPropertyType();
    }
    if (instanceofPropertyType(type)) {
        return type;
    }
    if (typeof type == "function") {
        return new PropertyTypes.ObjectPropertyType(type);
    }
    return new PropertyTypes.EnumPropertyType(type);
}

export function safeSerialize(type: PropertyType, smokeScreen: SmokeScreen, value: any) {
    const translated = type.serialize(smokeScreen, value);
    return typeof translated == "undefined" ? value : translated;
}

export function safeDeserialize(type: PropertyType, smokeScreen: SmokeScreen, value: any) {
    const translated = type.deserialize(smokeScreen, value);
    return typeof translated == "undefined" ? value : translated;
}

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

class StringPropertyType implements PropertyType {

    serialize(_smokeScreen: SmokeScreen, _value: any): any {
        return;
    }

    deserialize(_smokeScreen: SmokeScreen, value: any): any {
        if (typeof value !== "string") {
            throw new Error("must be a string");
        }
    }

}

class NumberPropertyType implements PropertyType {

    serialize(_smokeScreen: SmokeScreen, _value: any): any {
        return;
    }

    deserialize(_smokeScreen: SmokeScreen, value: any): any {
        if (typeof value !== "number") {
            throw new Error("must be a number");
        }
    }

}

class BooleanPropertyType implements PropertyType {

    serialize(_smokeScreen: SmokeScreen, _value: any): any {
        return;
    }

    deserialize(_smokeScreen: SmokeScreen, value: any): any {
        if (typeof value !== "boolean") {
            throw new Error("must be a boolean");
        }
    }

}

class EnumPropertyType<T extends EnumClass> implements PropertyType {

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

class ArrayPropertyType implements PropertyType {

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
            result.push(this._itemType.serialize(smokeScreen, item));
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
                const translated = this._itemType.deserialize(smokeScreen, item);
                result.push(typeof translated !== "undefined" ? translated : item);
            } catch (e) {
                throw new Error(`item ${i} of the array ${e.message}`);
            }
        }
        return result;
    }

}

class MapPropertyType implements PropertyType {

    private readonly _itemType: PropertyType;

    constructor(itemType: ShortPropertyType) {
        this._itemType = parseShortPropertyType(itemType);
    }

    serialize(smokeScreen: SmokeScreen, value: any): any {
        if (!(value instanceof Map)) {
            throw new Error("must be a Map object");
        }
        const exposure: any = {};
        for (const key of value.keys()) {
            const item = value.get(key);
            exposure[key] = this._itemType.serialize(smokeScreen, item);
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
                const item = value[key];
                const translated = this._itemType.deserialize(smokeScreen, item);
                result.set(key, typeof translated !== "undefined" ? translated : item);
            } catch (e) {
                throw new Error(`key ${key} of the map ${e.message}`);
            }
        }
        return result;
    }

}

class ObjectPropertyType<T> implements PropertyType {

    constructor(private readonly _objectClass: Constructable<T>) {}

    serialize(smokeScreen: SmokeScreen, value: any): any {
        return smokeScreen.toObject(value);
    }

    deserialize(smokeScreen: SmokeScreen, value: any): any {
        return smokeScreen.fromObject(value, this._objectClass);
    }

}

/**
 * String property type
 */
export const StringType: PropertyType = new StringPropertyType();

/**
 * Number property type
 */
export const NumberType: PropertyType = new NumberPropertyType();

/**
 * Boolean property type
 */
export const BooleanType: PropertyType = new BooleanPropertyType();

/**
 * Returns an object property type
 * @param {Constructable} objectClass    the object class
 */
export const ObjectType: <T>(objectClass: Constructable<T>) => PropertyType =
    objectClass => new ObjectPropertyType(objectClass);

/**
 * Returns an enum property type of the given enum
 * @param enumClass                     the enum class
 * @param {boolean} caseSensitive       whether or not to enforce case sensitivity
 *                                      when deserializing
 */
export const EnumType: <T extends EnumClass>(enumClass: T, caseSensitive?: boolean) =>
    PropertyType = (enumClass, caseSensitive = false) =>
    new EnumPropertyType(enumClass, caseSensitive);

/**
 * Returns an array property type
 * @param {PropertyType} itemType       a property type to be used for the array
 *                                      items
 */
export const ArrayType: (itemType: ShortPropertyType) => PropertyType
    = (itemType: ShortPropertyType) => new ArrayPropertyType(itemType);

/**
 * Returns a map property type
 * @param {PropertyType} itemType       a property type to be used for the array
 *                                      items
 */
export const MapType: (itemType: ShortPropertyType) => PropertyType
    = (itemType: ShortPropertyType) => new MapPropertyType(itemType);

export type PrimitiveType = "string" | "number" | "boolean";
export type SingleType = PrimitiveType | Constructable<any> | EnumClass | PropertyType;
export type ShortPropertyType = SingleType | [SingleType];

export function instanceofPropertyType(type: ShortPropertyType): type is PropertyType {
    return typeof type == "object" &&
        (type as any).serialize &&
        (type as any).deserialize;
}

export function parseShortPropertyType(type: ShortPropertyType): PropertyType {
    if (type instanceof Array) {
        const itemType = type[0];
        return ArrayType(parseShortPropertyType(itemType));
    }
    if (type == "string") {
        return StringType;
    }
    if (type == "boolean") {
        return BooleanType;
    }
    if (type == "number") {
        return NumberType;
    }
    if (instanceofPropertyType(type)) {
        return type;
    }
    if (typeof type == "function") {
        return ObjectType(type);
    }
    return EnumType(type);
}

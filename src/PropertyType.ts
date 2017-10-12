import {SmokeScreen} from "./SmokeScreen";
import {Constructable} from "./Constructable";

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
 * Out of the box property type implementations
 */
export namespace PropertyTypes {

    class StringType implements PropertyType {

        serialize(_smokeScreen: SmokeScreen, _value: any): any {
            return;
        }

        deserialize(_smokeScreen: SmokeScreen, value: any): any {
            if (typeof value !== "string") {
                throw new Error("must be a string");
            }
        }

    }

    class NumberType implements PropertyType {

        serialize(_smokeScreen: SmokeScreen, _value: any): any {
            return;
        }

        deserialize(_smokeScreen: SmokeScreen, value: any): any {
            if (typeof value !== "number") {
                throw new Error("must be a number");
            }
        }

    }

    class BooleanType implements PropertyType {

        serialize(_smokeScreen: SmokeScreen, _value: any): any {
            return;
        }

        deserialize(_smokeScreen: SmokeScreen, value: any): any {
            if (typeof value !== "boolean") {
                throw new Error("must be a boolean");
            }
        }

    }

    class EnumType<T> implements PropertyType {

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
            throw new Error("must be one of (" + this.getAllKeys().join(", ") + ")");
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

    class ArrayType implements PropertyType {

        constructor(private readonly _itemType: PropertyType) {}

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
            for (const item of value) {
                try {
                    const translated = this._itemType.deserialize(smokeScreen, item);
                    result.push(typeof translated !== "undefined" ? translated : item);
                } catch (e) {
                    throw new Error("all items of the array " + e.message);
                }
            }
            return result;
        }

    }

    class ObjectType<T> implements PropertyType {

        constructor(private readonly _objectClass: Constructable<T>) {
        }

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
    export const string = new StringType();     // tslint:disable-line

    /**
     * Number property type
     */
    export const number = new NumberType();     // tslint:disable-line

    /**
     * Boolean property type
     */
    export const boolean = new BooleanType();   // tslint:disable-line

    /**
     * Returns an object property type
     * @param {Constructable} objectClass    the object class
     */
    export const objectOf = <T>(objectClass: Constructable<T>) =>
        new ObjectType(objectClass);

    /**
     * Returns an enum property type of the given enum
     * @param enumClass                     the enum class
     * @param {boolean} caseSensitive       whether or not to enforce case sensitivity
     *                                      when deserializing
     */
    export const enumOf = <T>(enumClass: T, caseSensitive = false) =>
        new EnumType(enumClass, caseSensitive);

    /**
     * Returns an array property type
     * @param {PropertyType} itemType       a property type to be used for the array
     *                                      items
     */
    export const arrayOf = (itemType: PropertyType) =>
        new ArrayType(itemType);

}

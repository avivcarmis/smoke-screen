import {Type} from "./interfaces";

export namespace Types {

    class StringType implements Type {

        validate(value: any) {
            if (typeof value != "string") {
                throw new Error("must be a string");
            }
            return value;
        }

    }

    class NumberType implements Type {

        validate(value: any) {
            if (typeof value != "number") {
                throw new Error("must be a number");
            }
            return value;
        }

    }

    class BooleanType implements Type {

        validate(value: any) {
            if (typeof value != "boolean") {
                throw new Error("must be a boolean");
            }
            return value;
        }

    }

    class ArrayType implements Type {

        constructor(private readonly _itemType: Type) {}

        validate(value: any) {
            if (!(value instanceof Array)) {
                throw new Error("must be an array");
            }
            try {
                for (const item of value) {
                    this._itemType.validate(item);
                }
            } catch (e) {
                throw new Error("all items of the array " + e.message);
            }
            return value;
        }

    }

    class EnumType<T> implements Type {

        constructor(private readonly _enumClass: T,
                    private readonly _caseSensitive: boolean) {}

        validate(value: any): any {
            if (this._caseSensitive) {
                const result = (this._enumClass as any)[value];
                if (typeof result != "undefined") {
                    return result;
                }
            }
            else {
                for (const key of this.getAllKeys()) {
                    if (key.toLowerCase() == value.trim().toLowerCase()) {
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

    export const string = new StringType();

    export const number = new NumberType();

    export const boolean = new BooleanType();

    export const enumOf = <T>(enumClass: T, caseSensitive = false) =>
        new EnumType(enumClass, caseSensitive);

    export const stringArray = new ArrayType(string);

    export const numberArray = new ArrayType(number);

    export const booleanArray = new ArrayType(boolean);

    export const enumArrayOf = <T>(enumClass: T, caseSensitive = false) =>
        new ArrayType(new EnumType(enumClass, caseSensitive));

}
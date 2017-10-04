import {PropertyType} from "./interfaces";

class StringType implements PropertyType {

    translateOutput(value: any): any {
        return value;
    }

    translateInput(value: any): any {
        if (typeof value != "string") {
            throw new Error("must be a string");
        }
        return value;
    }

}

class NumberType implements PropertyType {

    translateOutput(value: any): any {
        return value;
    }

    translateInput(value: any): any {
        if (typeof value != "number") {
            throw new Error("must be a number");
        }
        return value;
    }

}

class BooleanType implements PropertyType {

    translateOutput(value: any): any {
        return value;
    }

    translateInput(value: any): any {
        if (typeof value != "boolean") {
            throw new Error("must be a boolean");
        }
        return value;
    }

}

class EnumOfType<T> implements PropertyType {

    constructor(private readonly _enumClass: T,
                private readonly _caseSensitive = false) {}

    translateOutput(value: any): any {
        return (this._enumClass as any)[value];
    }

    translateInput(value: any): any {
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

class ArrayType implements PropertyType {

    constructor(private readonly _itemType: PropertyType) {}

    translateOutput(value: any): any {
        return value;
    }

    translateInput(value: any): any {
        if (!(value instanceof Array)) {
            throw new Error("must be an array");
        }
        try {
            for (const item of value) {
                this._itemType.translateInput(item);
            }
        } catch (e) {
            throw new Error("all items of the array " + e.message);
        }
        return value;
    }

}

export namespace PropertyTypes {

    export const string = new StringType();

    export const number = new NumberType();

    export const boolean = new BooleanType();

    export const enumOf = <T>(enumClass: T, caseSensitive = false) =>
        new EnumOfType(enumClass, caseSensitive);

    export const stringArray = new ArrayType(string);

    export const numberArray = new ArrayType(number);

    export const booleanArray = new ArrayType(boolean);

    export const enumArrayOf = <T>(enumClass: T, caseSensitive = false) =>
        new ArrayType(enumOf(enumClass, caseSensitive));

}
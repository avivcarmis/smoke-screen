import {Constructable, isConstructable, PropertyType} from "./interfaces";
import {SmokeScreen} from "./SmokeScreen";

class StringType implements PropertyType {

    translateOutput(_smokeScreen: SmokeScreen, value: any): any {
        return value;
    }

    translateInput(_smokeScreen: SmokeScreen, value: any): any {
        if (typeof value != "string") {
            throw new Error("must be a string");
        }
        return value;
    }

}

class NumberType implements PropertyType {

    translateOutput(_smokeScreen: SmokeScreen, value: any): any {
        return value;
    }

    translateInput(_smokeScreen: SmokeScreen, value: any): any {
        if (typeof value != "number") {
            throw new Error("must be a number");
        }
        return value;
    }

}

class BooleanType implements PropertyType {

    translateOutput(_smokeScreen: SmokeScreen, value: any): any {
        return value;
    }

    translateInput(_smokeScreen: SmokeScreen, value: any): any {
        if (typeof value != "boolean") {
            throw new Error("must be a boolean");
        }
        return value;
    }

}

class EnumType<T> implements PropertyType {

    constructor(private readonly _enumClass: T,
                private readonly _caseSensitive = false) {}

    translateOutput(_smokeScreen: SmokeScreen, value: any): any {
        return (this._enumClass as any)[value];
    }

    translateInput(_smokeScreen: SmokeScreen, value: any): any {
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

    constructor(private readonly _itemType: PropertyType | Constructable<any>) {}

    translateOutput(_smokeScreen: SmokeScreen, value: any): any {
        return value;
    }

    translateInput(_smokeScreen: SmokeScreen, value: any): any {
        if (!(value instanceof Array)) {
            throw new Error("must be an array");
        }
        const result = [];
        for (const item of value) {
            let translated;
            if (isConstructable(this._itemType)) {
                try {
                    translated = _smokeScreen.fromObject(item, this._itemType);
                } catch (e) {
                    throw new Error("array parsing error: " + e.message);
                }
            }
            else {
                try {
                    translated = this._itemType.translateInput(_smokeScreen, item);
                } catch (e) {
                    throw new Error("all items of the array " + e.message);
                }
            }
            result.push(translated);
        }
        return result;
    }

}

export namespace PropertyTypes {

    export const string = new StringType();

    export const number = new NumberType();

    export const boolean = new BooleanType();

    export const enumOf = <T>(enumClass: T, caseSensitive = false) =>
        new EnumType(enumClass, caseSensitive);

    export const arrayOf = (itemType: PropertyType | Constructable<any>) =>
        new ArrayType(itemType);

}
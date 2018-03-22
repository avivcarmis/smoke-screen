import {PropertyType, ShortPropertyType} from "./PropertyType";

/**
 * An object describing the serialize and deserialize requirements
 * of a property
 */
export interface ExposureSettings {

    /**
     * May be specified to override the exposed property key
     */
    as?: string;

    /**
     * A property type to perform typing validation and translation
     */
    type?: PropertyType | ShortPropertyType;

    /**
     * A further validation function to perform a more specific validation
     * and translation if needed. Note that a validation is performed only
     * on deserialization and not on serialization.
     *
     * Validation may be performed by inspecting the input value parameter,
     * if the value is invalid, the function should throw an error describing
     * the invalidity.
     *
     * Translation may be performed by returning a value different than the
     * given one. Skipping translation may be performed by simply not
     * returning any value from the function, or by returning the given one.
     *
     * @param value     value to inspect
     * @returns {any}   translated value
     */
    validator?: (value: any) => any;

    /**
     * May be used to allow the property to not appear in the source of the
     * deserialization process.
     *
     * By default, exposed properties are required on deserialization,
     * unless this is set to true.
     */
    optional?: boolean;

    /**
     * May be used to allow the property a null value when deserializing.
     *
     * By default, exposed properties are may not receive null value on
     * deserialization, unless this is set to true.
     */
    nullable?: boolean;

}

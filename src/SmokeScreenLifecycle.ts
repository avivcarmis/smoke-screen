/**
 * An interface to implement in order to handle serialization and deserialization events
 */
export interface SmokeScreenLifecycle {

    /**
     * In case an implementation for this method exists, it will be called before
     * the object gets serialized by SmokeScreen. This is where we have a chance to
     * validate the object prior to its serialization. In case the object is invalid,
     * an error should be thrown.
     */
    beforeSerialize?: () => any;

    /**
     * In case an implementation for this method exists, it will be called after
     * the object gets deserialized by SmokeScreen. This is where we have a chance to
     * validate the object after its creation and the property values have been injected.
     * In case the object is invalid, an error should be thrown, causing the deserialization
     * to fail.
     */
    afterDeserialize?: () => any;

}

export function instanceOfSmokeScreenLifecycle(obj: any): obj is SmokeScreenLifecycle {
    return validateFunction(obj, "beforeSerialize", 0) ||
        validateFunction(obj, "afterDeserialize", 0);
}

function validateFunction(obj: any, functionName: string, argCount: number) {
    return typeof obj[functionName] == "function" && obj[functionName].length == argCount;
}

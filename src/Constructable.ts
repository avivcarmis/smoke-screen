/**
 * Helps TypeScript compiler validate class reference
 */
export interface Constructable<T> {

    new(): T;

}

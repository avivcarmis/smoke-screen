import {ReflectionService} from "./ReflectionService";
import {ExposureSettings} from "./ExposureSettings";

/**
 * Decorates a property without any custom exposure settings.
 */
export function exposed(target: any, propertyKey: string): void;

/**
 * Decorates a property with given Exposure settings.
 */
export function exposed(settings?: ExposureSettings): (target: any,
                                                       propertyKey: string) => void;

/**
 * Decoration implementation
 */
export function exposed(a: any, b?: string): any {
    function getDecorator(settings: ExposureSettings) {
        return (target: any, propertyKey: string) => {
            const reflectionMetadata = ReflectionService.extract(target);
            reflectionMetadata.addProperty(propertyKey, settings);
        };
    }
    if (b) {
        getDecorator({})(a, b);
    } else {
        return getDecorator(a || {});
    }
}

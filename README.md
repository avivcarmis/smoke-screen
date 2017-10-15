# Smoke Screen

[![SmokeScreen Build Status at Travis CI](https://api.travis-ci.org/avivcarmis/smoke-screen.svg?branch=master)]("https://api.travis-ci.org/avivcarmis/smoke-screen.svg?branch=master")

Strong typing validation for JavaScript runtime.

## In a Nutshell

Smoke Screen is a lightweight JS library allowing seamless schema validation and class instantiation.
Smoke Screen is designed to serialize and deserialize JavaScript objects, JSON or YAML string while enforcing validation, and performing property filtering and renaming.

## Getting Started

Installation via npm:

`$ npm install smoke-screen --save`

The following sections explain the main features of Smoke Screen.

> Comparability Note: Smoke Screen library depends on EcmaScript decorators. While 
EcmaScript doesn't officially support decorators yet, the examples below are 
implemented in TypeScript, but may also be implemented in any other way that compiles 
decorators.

### Basic Serialization and Deserialization

By default, all properties are transient, meaning they will not get exposed unless explicitly decorated with an `@exposed` decorator.

Since JavaScript does not keep typing information at runtime, if we would like to perform runtime validations, we will have to explicitly pass validation information to the runtime environment. In the following examples we will see how to do it. For now, let's just see how the basic serialization and deserialization works.

```typescript
class Person {

    @exposed
    name: string;

    transientProperty: string;

    whatsMyName() {
        console.log(this.name);
    }

}

const person = new Person();
person.name = "john";
person.transientProperty = "will not get exposed";
const smokeScreen = new SmokeScreen();
smokeScreen.toJSON(person); // -> {"name":"john"}
const json = JSON.stringify({name: "steve", age: 57.3, transientProperty: "value"});
const person2 = smokeScreen.fromJSON(json, Person);
console.log(person2); // -> Person { name: 'steve' }
person2.whatsMyName(); // -> 'steve'
```

### Exposure Settings

By default, properties are not validated or translated in any way.

To allow for those, we have to pass some information to JS runtime. We can do it by passing an `ExposureSettings` object to the `@exposed` decorator.

```typescript
class Person {

    @exposed({
        as: "myAge",
        type: PropertyTypes.number,
        validator: value => {
            if (value < 18) {
                throw new Error("must be at least 18");
            }
        }
    })
    age: number;

}

const person = new Person();
person.age = 56.8;
const smokeScreen = new SmokeScreen();
smokeScreen.toJSON(person); // -> {"myAge":56.8}
let json = JSON.stringify({myAge: 19});
const person2 = smokeScreen.fromJSON(json, Person);
console.log(person2); // -> Person { age: 19 }
json = JSON.stringify({age: 27});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' is missing
json = JSON.stringify({myAge: "oops"});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' must be a number
json = JSON.stringify({myAge: 17});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' must be at least 18
json = JSON.stringify({});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' is required
json = JSON.stringify({myAge: null});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' may not be null
```

As can be seen in the example, `exposed` properties are by default required and non-nullable. A property can be optional, by passing a default value to be set when no value is specified in the source:

```typescript
class Person {

    @exposed({
        as: "myAge",
        type: PropertyTypes.number,
        defaultValue: 42.3
    })
    age: number;

}

const json = JSON.stringify({});
const person = smokeScreen.fromJSON(json, Person);
console.log(person); // -> Person { age: 42.3 }
```

A property can also become nullable:

```typescript
class Person {

    @exposed({
        as: "myAge",
        type: PropertyTypes.number,
        nullable: true
    })
    age: number;

}

const json = JSON.stringify({myAge: null});
const person = smokeScreen.fromJSON(json, Person);
console.log(person); // -> Person { age: null }
```

### Property Types

All property types are available under the namespace `PropertyTypes`. If set, input types are enforced.
If any property contains illegal type, an `Error` will be thrown describing the unmet requirement.

```typescript
enum Mood {

    HAPPY, SAD

}

class Animal {

    @exposed({type: PropertyTypes.string})
    name: string;

}

class Person {

    @exposed({type: PropertyTypes.string})
    name: string;

    @exposed({type: PropertyTypes.number})
    age: number;

    @exposed({type: PropertyTypes.boolean})
    isFunny: boolean;

    @exposed({type: PropertyTypes.enumOf(Mood)})
    mood: Mood;

    @exposed({type: PropertyTypes.objectOf(Animal)})
    pet: Animal;

    @exposed({type: PropertyTypes.arrayOf(PropertyTypes.string)})
    speaks: string[];

}

const smokeScreen = new SmokeScreen();
const json = JSON.stringify({
    name: "jason",
    age: 72,
    isFunny: true,
    mood: "happy",
    pet: {name: "bobby"},
    speaks: ["english", "spanish"]
});
const person = smokeScreen.fromJSON(json, Person);
console.log(person); // ->
// Person {
//     name: 'jason',
//         age: 72,
//         isFunny: true,
//         mood: Mood.HAPPY,
//         pet: Animal { name: 'bobby' },
//     speaks: [ 'english', 'spanish' ] }
```

To enable custom property types, any implementation of the `PropertyType` interface may be passed to the `@exposed` `type` field.

### Naming Translators

All naming translators are available under the namespace `NamingTranslators`. If set, serialized and deserialized property names are converted accordingly.

```typescript
class Person {

    @exposed
    firstName: string;

    @exposed
    lastName: string;

}

const person = new Person();
person.firstName = "John";
person.lastName = "Doe";
let smokeScreen = new SmokeScreen();
console.log(smokeScreen.toJSON(person)); // -> {"firstName":"John","lastName":"Doe"}
smokeScreen = new SmokeScreen(NamingTranslators.lowerSnakeCase);
console.log(smokeScreen.toJSON(person)); // -> {"first_name":"John","last_name":"Doe"}
smokeScreen = new SmokeScreen(NamingTranslators.upperKebabCase);
console.log(smokeScreen.toJSON(person)); // -> {"FIRST-NAME":"John","LAST-NAME":"Doe"}
const json = JSON.stringify({"FIRST-NAME": "John", "LAST-NAME": "Doe"});
console.log(smokeScreen.fromJSON(json, Person)); // -> Person { firstName: 'John', lastName: 'Doe' }
```

To enable custom naming translators, any implementation of a `NamingTranslator` type may be passed when instantiating a new `SmokeScreen` object.

## Exposing Properties

Exposing properties is done using the `@exposed` decorator, which accepts an optional 
`ExposureSettings` object:

- `as?: string` - May be specified to override the exposed property key
- `type?: PropertyType` - A property type to perform typing validation and translation.
 (Further reading in [`PropertyType` the JSDocs](https://github.com/avivcarmis/smoke-screen/blob/master/src/PropertyType.ts#L8 "`PropertyType` the JSDocs"))
- `validator?: (value: any) => any` - A further validation function to perform a more 
specific validation and translation if needed. Note that a validation is performed only on deserialization and *not* on serialization.
Validation may be performed by inspecting the input value parameter, if the value is invalid, the function should throw an error describing the invalidity.
Translation may be performed by returning a value different than the given one. Skipping translation may be performed by simply not returning any value from the function, or by returning the given one.
- `defaultValue?: any` - May be used to declare the property as optional on 
deserialization process. Then, in case the property is missing, it receives the given default value.
By default, exposed properties are required on deserialization, unless a default value is specified.
- `nullable?: boolean` - May be used to allow the property a null value when 
deserializing. By default, exposed properties are may not receive null value on deserialization, unless this is set to true.

## The Smoke Screen Interface

To use Smoke Screen features, e.g. serialization and deserialization, an instance of 
`SmokeScreen` class must be first created. Once an instance is available, it provides 
the following methods:

- `toJSON(object: any): string` - takes any object and returns a JSON string of the 
exposed object.
- `fromJSON<T>(json: string, instanceClass: Constructable<T>): T` - takes a JSON string
and a class to deserialize into and returns a validated instance of the class, or 
throws an Error in case of invalid input.
- `toYAML(object: any): string` - takes any object and returns a YAML string of the 
exposed object.
- `fromYAML<T>(yaml: string, instanceClass: Constructable<T>): T` - takes a YAML string
and a class to deserialize into and returns a validated instance of the class, or 
throws an Error in case of invalid input.
- `toObject(object: any): {[key: string]: any}` - takes any object and returns a 
generic JS object containing the exposed representation of the given object. This means
that properties may be filtered, property names may be altered, and property values may be translated.
- `fromObject<T>(exposure: {[key: string]: any}, instanceClass: Constructable<T>)` - 
takes a generic JS object and a class to deserialize into and returns a validated instance of the class, or throws an Error in case of invalid input.

## Useful Links
- [The project GitHub page](https://github.com/avivcarmis/smoke-screen "The project GitHub page")
- [The project Issue Tracker on GitHub](https://github.com/avivcarmis/smoke-screen/issues "The project Issue Tracker on GitHub")
- [The project build Status at Travis CI](https://travis-ci.org/avivcarmis/smoke-screen "The project build Status at Travis CI")

## License
Smoke Screen is registered under <a href="https://github.com/avivcarmis/smoke-screen/blob/master/LICENSE" target="_blank">MIT</a> license.

## Contribution
Really, any kind of contribution will be warmly accepted. (:
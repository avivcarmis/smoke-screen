# Smoke Screen

[![SmokeScreen Build Status at Travis CI](https://api.travis-ci.org/avivcarmis/smoke-screen.svg?branch=master)]("https://api.travis-ci.org/avivcarmis/smoke-screen.svg?branch=master")

Strongly typed validation for JavaScript runtime.

## In a Nutshell

Smoke Screen is a lightweight JS library allowing seamless schema validation and class instantiation.
Smoke Screen is designed to serialize and deserialize JavaScript objects and JSON strings while enforcing validation, and performing property filtering and modification.

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

// let's serialize a Person object into a JSON string
const person = new Person();
person.name = "john";
person.transientProperty = "will not get exposed";
const smokeScreen = new SmokeScreen();
smokeScreen.toJSON(person); // -> '{"name":"john"}'

// let's deserialize a JSON string into a Person object
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
        type: Number,
        validator: value => {
            if (value < 18) {
                throw new Error("must be at least 18");
            }
        }
    })
    age: number;

}

// let's serialize a Person object into a JSON string
const person = new Person();
person.age = 56.8;
const smokeScreen = new SmokeScreen();
smokeScreen.toJSON(person); // -> '{"myAge":56.8}'

// let's deserialize a JSON string into a Person object
let json = JSON.stringify({myAge: 19});
const person2 = smokeScreen.fromJSON(json, Person);
console.log(person2); // -> Person { age: 19 }

// let's see the typing validation in action
json = JSON.stringify({myAge: "oops"});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' must be a number

// let's see the custom validator in action
json = JSON.stringify({myAge: 17});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' must be at least 18

// let's see property naming in action
json = JSON.stringify({age: 27});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' is required

// unless otherwise specified, exposed properties are required
json = JSON.stringify({});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' is required

// unless otherwise specified, exposed properties may not be null
json = JSON.stringify({myAge: null});
smokeScreen.fromJSON(json, Person); // Error: illegal input - property 'myAge' may not be null
```

As can be seen in the example, `exposed` properties are by default required and non-nullable. A property can become optional by setting the optional flag to true, and optionally set the default property value in the constructor, like so:

```typescript
class Person {

    @exposed({
        as: "myAge",
        type: Number,
        optional: true 
    })
    age = 42.3;

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
        type: Number,
        nullable: true
    })
    age: number | null;

}

const json = JSON.stringify({myAge: null});
const person = smokeScreen.fromJSON(json, Person);
console.log(person); // -> Person { age: null }
```

### Property Types

Setting the exposure type allows us to enforce strong typing and to translate input and output values.
A property type must be an object implementing the `PropertyType` interface. This is very simple to implement in case you want to achieve any custom behavior you like; However, Smoke Screen provides out-of-the-box implementation for all major types under the `PropertyTypes` namespace:
- `StringPropertyType`
- `NumberPropertyType`
- `BooleanPropertyType`
- `ObjectPropertyType`
- `ArrayPropertyType`
- `EnumPropertyType`
- `MapPropertyType`
- `SetPropertyType`

For example:

```typescript
class Pet {

    @exposed({type: new StringPropertyType()})
    name: string;
    
}

class Person {

    @exposed({type: new NumberPropertyType()})
    age: number;
    
    @exposed({type: new ArrayPropertyType(new ObjectPropertyType(Pet))})
    pets: Pet[];
    
    @exposed({type: new SetPropertyType(new StringPropertyType())})
    favoriteFoods: Set<string>;
    
    @exposed({type: new MapPropertyType(new StringPropertyType(), new BooleanPropertyType())})
    likesAndDislikes: Map<string, boolean>;

}
````

Note that instead of referencing these `PropertyType` classes directly, its possible to use a short writing as follows:

- Instead of referencing `StringPropertyType`, we can simply reference the native `String` class.
- Instead of referencing `NumberPropertyType`, we can simply reference the native `Number` class.
- Instead of referencing `BooleanPropertyType`, we can simply reference the native `Boolean` class.
- Instead of referencing `ObjectPropertyType`, we can simply reference object class itself.
- Instead of referencing `EnumPropertyType`, we can simply reference enum class itself.
- Instead of referencing `ArrayPropertyType`, we can simply create an array containing exactly one property type, stating the array type.

Let's see all of this in action:

```typescript
enum Mood {

    HAPPY, SAD

}

class Animal {

    @exposed({type: String})
    name: string;

}

class Person {

    @exposed({type: String}) // string short writing
    name: string;

    @exposed({type: Number}) // number short writing
    age: number;

    @exposed({type: Boolean}) // boolean short writing
    isFunny: boolean;

    @exposed({type: Mood}) // enum short writing
    mood: Mood;

    @exposed({type: Animal}) // object short writing
    favoritePet: Animal;

    @exposed({type: [Animal]}) // array and object short writing
    pets: Animal[];

    @exposed({type: [String]}) // array and string short writing
    speaks: string[];
    
    @exposed({type: new SetPropertyType(String)}) // string short writing
    favoriteFoods: Set<string>;
    
    @exposed({type: new MapPropertyType(String, Boolean)}) // string and boolean short writing
    likesAndDislikes: Map<string, boolean>;

}
```

To enable custom property types, any implementation of the `PropertyType` interface may be passed to the `@exposed` `type` field.

### Naming Translators

Smoke screen allows for automatic translation of property names. For instance you may want to expose all property names using `camel_case`.
To achieve any custom translation, an implementation of a `NamingTranslator` function must be created which receive an internal property name, and returns the external name to expose; However, Smoke Screen provides out-of-the-box implementation for all major naming conventions under the `NamingTranslators` namespace:
- `upperCamelCase` - WhichLooksLikeThis
- `lowerSnakeCase` - which_looks_like_this
- `upperSnakeCase` - WHICH_LOOKS_LIKE_THIS
- `lowerKebabCase` - which-looks-like-this
- `upperKebabCase` - WHICH-LOOKS-LIKE-THIS
Let's see that in action:

```typescript
class Person {

    @exposed
    firstName: string;

    @exposed
    lastName: string;

}

// let's see the result without any naming translation
const person = new Person();
person.firstName = "John";
person.lastName = "Doe";
let smokeScreen = new SmokeScreen();
console.log(smokeScreen.toJSON(person)); // -> '{"firstName":"John","lastName":"Doe"}'

// let's see the result with lower snake case naming translation
smokeScreen = new SmokeScreen(NamingTranslators.lowerSnakeCase);
console.log(smokeScreen.toJSON(person)); // -> '{"first_name":"John","last_name":"Doe"}'

// let's see the result with upper kebab case naming translation
smokeScreen = new SmokeScreen(NamingTranslators.upperKebabCase);
console.log(smokeScreen.toJSON(person)); // -> '{"FIRST-NAME":"John","LAST-NAME":"Doe"}'
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
- `optional?: boolean` - May be used to allow the property to not appear in the source of the deserialization process.
By default, exposed properties are required on deserialization, unless this is set to true.
- `nullable?: boolean` - May be used to allow the property a null value when 
deserializing. By default, exposed properties are may not receive null value on deserialization, unless this is set to true.

## Smoke Screen Lifecycle

The `exposed` decorator allows for simple and flexible validation of each property; However, it does not provide any means of validating the entire object. For that end, Smoke Screen provides an additional
interface `SmokeScreenLifecycle` which allows to register for certain events in the lifecycle of the screening process:

- `beforeSerialize` - To validate an entire object before its being serialized, a zero arguments `beforeSerialize` method must be implemented, validating the object, and throwing an error in case it is not valid.
- `afterDeserialize` - To validate an entire object after it has been deserialized, a zero arguments `afterDeserialize` method must be implemented, validating the object, and throwing an error in case it is not valid.

```typescript
// note that it is not required to state `implements SmokeScreenLifecycle`,
// but merely to implement any of it's methods
class Person implements SmokeScreenLifecycle {

    @exposed
    age: number;

    @exposed
    drinksAlcohol: boolean;

    constructor(age: number, drinksAlcohol: boolean) {
        this.age = age;
        this.drinksAlcohol = drinksAlcohol;
    }

    beforeSerialize() {
        if (this.age < 18 && this.drinksAlcohol) {
            throw new Error("invalid during serialization");
        }
    }

    afterDeserialize() {
        if (this.age < 18 && this.drinksAlcohol) {
            throw new Error("invalid during deserialization");
        }
    }

}

const smokeScreen = new SmokeScreen();

// validate on deserialize
const json = JSON.stringify({age: 17, drinksAlcohol: true});
smokeScreen.fromJSON(json, Person); // -> Error: invalid during deserialization

// validate on serialize
const person = new Person(17, true);
smokeScreen.toJSON(person); // -> Error: invalid during serialization
```

## The Smoke Screen Interface

To use Smoke Screen features, e.g. serialization and deserialization, an instance of 
`SmokeScreen` class must be first created. Once an instance is available, it provides 
the following methods:

- `toJSON(object: any): string` - Serializes the given object to a JSON string.
Filtering properties and translating property names and their values if needed.
- `fromJSON<T>(json: string, instanceClass: Constructable<T>): T` - Deserializes the given
JSON string into a fresh instance of the given class and returns it. 
Filtering properties, validates and translates the property names and their values if
needed. throws an Error in case of invalid input.
- `updateFromJSON<T>(json: string, instance: T): void` - Deserializes the given JSON
string into the given instance. Filtering properties, validates and translates the 
property names and their values if needed. throws an Error in case of invalid input.
- `toObject(object: any): {[key: string]: any}` - Serializes the given object to a generic
JS object containing the exposure. Filtering properties and translating property names
and their values if needed.
- `fromObject<T>(exposure: {[key: string]: any}, instanceClass: Constructable<T>)` - 
Deserializes the given generic JS object into a fresh instance of the given class
and returns it. Filtering properties, validates and translates the property names
and their values if needed. throws an Error in case of invalid input.
- `updateFromObject<T>(exposure: {[key: string]: any}, instance: T): void` - Deserializes
the given generic JS object into the given instance. Filtering properties, validates 
and translates the property names and their values if needed. throws an Error in case 
of invalid input.

## Useful Links
- [The project GitHub page](https://github.com/avivcarmis/smoke-screen "The project GitHub page")
- [The project Issue Tracker on GitHub](https://github.com/avivcarmis/smoke-screen/issues "The project Issue Tracker on GitHub")
- [The project build Status at Travis CI](https://travis-ci.org/avivcarmis/smoke-screen "The project build Status at Travis CI")

## License
Smoke Screen is registered under <a href="https://github.com/avivcarmis/smoke-screen/blob/master/LICENSE" target="_blank">MIT</a> license.

## Contribution
Really, any kind of contribution will be warmly accepted. (:

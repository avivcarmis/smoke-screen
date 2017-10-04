import {SmokeScreen} from "./SmokeScreen";
import {exposed} from "./interfaces";
import {Types} from "./Types";

class Pet {

    @exposed()
    name: string;

    petbla: boolean;

}

class Person {

    @exposed({type: Types.string})
    name: string;

    @exposed({as: "the-age", type: Types.number})
    age: number;

    @exposed({type: Pet})
    pet: Pet;

    bla: boolean;

}

const smokeScreen = new SmokeScreen();
const pet = new Pet();
pet.name = "zadik";
pet.petbla = true;
const person = new Person();
person.name = "aviv";
person.age = 12;
person.pet = pet;
person.bla = true;

const blabla = smokeScreen.toJSON(person);
// noinspection TsLint
console.log(blabla);

// try {
//     const ioooo = smokeScreen.fromJSON("{\"name\":\"bka\",\"the-age\":12,\"bla\":1234,\"pet\":{\"name\":\"zadik\",\"petbla\":121212}}", Person);
// // noinspection TsLint
//     console.log(ioooo);
// } catch (e) {
//     // noinspection TsLint
//     debugger;
// }

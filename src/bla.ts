import {SmokeScreen} from "./SmokeScreen";
import {exposed} from "./interfaces";
import {PropertyTypes} from "./PropertyTypes";
import {NamingTranslators} from "./NamingTranslators";

class Pet {

    @exposed()
    theName: string;

    petBla: boolean;

}

enum XMLParser {
    BLA, IO
}

class Person {

    @exposed({type: PropertyTypes.string})
    personName: string;

    @exposed({as: "the-age", type: PropertyTypes.number})
    age: number;

    @exposed({type: Pet})
    pet: Pet;

    @exposed({type: PropertyTypes.enumOf(XMLParser)})
    myXMLParser: XMLParser;

    personBla: boolean;

}

const smokeScreen = new SmokeScreen(NamingTranslators.lowerSnakeCaseTranslator);
const pet = new Pet();
pet.theName = "zadik";
pet.petBla = true;
const person = new Person();
person.personName = "aviv";
person.age = 12;
person.pet = pet;
person.personBla = true;
person.myXMLParser = XMLParser.BLA;

// const blabla = smokeScreen.toJSON(person);
// // noinspection TsLint
// console.log(blabla);

try {
    const ioooo = smokeScreen.fromJSON("{\"person_name\":\"aviv\",\"the-age\":12,\"pet\":{\"the_name\":\"zadik\",\"pet_bla\":true},\"my_xml_parser\":\"ioi\",\"person_bla\":\"dasdsa\"}", Person);
// noinspection TsLint
    console.log(ioooo);
} catch (e) {
    // noinspection TsLint
    debugger;
}

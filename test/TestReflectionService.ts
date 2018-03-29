import "mocha";
import {expect} from "chai";
import {exposed} from "../src/exposed";
import {ReflectionService} from "../src/ReflectionService";

it("Test ReflectionService", () => {

    class Parent {
        @exposed
        parentProperty: string;
        constructor(parentProperty: string) {
            this.parentProperty = parentProperty;
        }
    }

    class ChildA extends Parent {
        @exposed
        childAProperty: string;
        constructor(parentProperty: string, childAProperty: string) {
            super(parentProperty);
            this.childAProperty = childAProperty;
        }
    }

    class ChildB extends Parent {
        @exposed
        childBProperty: string;
        constructor(parentProperty: string, childBProperty: string) {
            super(parentProperty);
            this.childBProperty = childBProperty;
        }
    }

    class OtherClass {
        @exposed
        otherProperty: string;
        constructor(blaProperty: string) {
            this.otherProperty = blaProperty;
        }
    }

    const parentPropertyKeys = ReflectionService.forClass(new Parent("")).getPropertyKeys();
    expect(parentPropertyKeys.length).to.equal(1);
    expect(parentPropertyKeys).to.contain("parentProperty");

    const childAPropertyKeys = ReflectionService.forClass(new ChildA("", "")).getPropertyKeys();
    expect(childAPropertyKeys.length).to.equal(2);
    expect(childAPropertyKeys).to.contain("parentProperty");
    expect(childAPropertyKeys).to.contain("childAProperty");

    const childBPropertyKeys = ReflectionService.forClass(new ChildB("", "")).getPropertyKeys();
    expect(childBPropertyKeys.length).to.equal(2);
    expect(childBPropertyKeys).to.contain("parentProperty");
    expect(childBPropertyKeys).to.contain("childBProperty");

    const otherPropertyKeys = ReflectionService.forClass(new OtherClass("")).getPropertyKeys();
    expect(otherPropertyKeys.length).to.equal(1);
    expect(otherPropertyKeys).to.contain("otherProperty");

});

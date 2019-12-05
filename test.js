class TestClass {
    constructor() {
        this.hello = "Hello, world!";
    }
    theMethod() {
        console.log("The method!!");
    }
}
class NewTestClass extends TestClass {
    constructor() {
        super();
    }

    theMethod() {
        console.log(super.theMethod(), "and then some!!");
    }
}

const inst = new TestClass();
const sub = new NewTestClass();

sub.theMethod() // Should print "The method!! and then some!!"
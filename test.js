class A {
    constructor () {}
    reliesOnChildProp() {
        console.log(this.prop);
    }
}
class B extends A {
    constructor() { 
        super();
        this.prop = 'something';
        super.reliesOnChildProp();
    }

}

const inst = new A();
const sub = new B();

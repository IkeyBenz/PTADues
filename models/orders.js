const firebase = require('firebase');
const ref = firebase.database().ref('Orders');
const promise = require('bluebird');
const writeFile = promise.promisify(require('fs').writeFile);

module.exports = (function () {
    function create(orderInfo) {
        return new Promise(function (resolve, reject) {
            if (orderInfo) {
                getNewOrderId().then(async (newOrderId) => {
                    ref.child(newOrderId).set(orderInfo);
                    const infoWithTeachers = await _populateTeachers(orderInfo);
                    resolve({ ...infoWithTeachers, orderId: newOrderId });
                });
            } else {
                reject('Form not filled out.');
            }
        });
    }
    async function createHanukkahOrder(orderInfo) {
        const newOrderId = await getNewOrderId();
        ref.child(newOrderId).set({
            orderInfo: { Amount: orderInfo.Amount, Email: orderInfo.Email, Timestamp: orderInfo.Timestamp },
            children: orderInfo.Children
        });
        return newOrderId;
    }
    function _populateTeachers(orderInfo) {
        return new Promise(async (resolve, reject) => {
            let teachers = [];
            for (let teacher of orderInfo.teachers) {
                const teacherName = await firebase.database().ref(`FacultyMembers/${teacher.Id}`).once('value').then(s => {
                    return { teacher: s.val().Name, gifter: teacher.gifter, teacherId: teacher.Id }
                });
                teachers.push(teacherName);
            }
            resolve({ ...orderInfo, teachers })
        });
    }
    function structureOrder(orderDetails) {
        let children = []
        for (let i = 1; i <= 5; i++) {
            if (orderDetails[`child${i}Name`] != "") {
                children.push({
                    name: orderDetails[`child${i}Name`],
                    grade: orderDetails[`child${i}Grade`]
                });
            }
        }
        return {
            orderInfo: {
                Address: orderDetails.Address,
                Amount: orderDetails.Amount,
                Email: orderDetails.Email,
                Name: orderDetails.Name,
                Phone: orderDetails.Phone,
                Timestamp: orderDetails.Timestamp
            },
            children: children
        }
    }

    function getNewOrderId() {
        return new Promise(function (resolve, reject) {
            ref.orderByKey().limitToLast(1).once('value').then(snapshot => {
                const lastId = Object.keys(snapshot.val())[0];
                resolve(fixOrderId(lastId));
            });
        });
    }
    function fixOrderId(oldId) {
        let numberString = oldId.slice(3, oldId.length);
        let newNumber = String(Number(numberString) + 1);
        newNumber = '0'.repeat(numberString.length - newNumber.length) + newNumber;
        return 'PTA' + newNumber
    }
    async function getOrdersForHandlebars() {
        const snapshot = await ref.once('value');
        const orders = snapshot.val();
        let formattedOrders = [];
        for (let orderKey in orders) {
            let newOrder = {
                orderId: orderKey,
                orderInfo: [],
                children: orders[orderKey].children
            };
            for (let key in orders[orderKey].orderInfo) {
                newOrder.orderInfo.push({
                    key: key,
                    val: orders[orderKey].orderInfo[key]
                });
            }
            formattedOrders.push(newOrder);
        }
        return formattedOrders;
    }

    async function getAllAsCSV() {
        const snapshot = await ref.once('value');
        const orders = snapshot.val();
        let csvString = 'OrderID,Name,Email,Phone,Address,Amount\n';
        for (let orderKey in orders) {
            const name = orders[orderKey].orderInfo.Name
                , email = orders[orderKey].orderInfo.Email
                , phone = orders[orderKey].orderInfo.Phone
                , address = removeCommasFrom(orders[orderKey].orderInfo.Address)
                , amount = orders[orderKey].orderInfo.Amount;

            csvString += `${orderKey},${name},${email},${phone},${address},${amount}\n`;
        }
        return writeFile(__dirname + '/../orders.csv', csvString);
    }
    function removeCommasFrom(string) {
        let newString = '';
        for (let i = 0; i < string.length; i++) {
            if (string.charAt(i) != ',') {
                newString += string.charAt(i);
            }
        }
        return newString
    }

    async function getOrders() {
        const orders = await ref.once('value').then(s => s.val())
            , faculty = await firebase.database().ref('FacultyMembers').once('value').then(s => s.val())
            , firstPurimOrderNumber = 69
            , lastDuesOrderNumber = 57
            , orderNumber = (str) => Number(str.slice(3));

        let duesOrders = [];
        let purimOrders = [];

        for (let orderId in orders) {
            let order = { ...orders[orderId], orderId }
            if (orderNumber(orderId) <= lastDuesOrderNumber) {
                order.orderInfo = Object.entries(order.orderInfo).map(v => { return { key: v[0], val: v[1] } })
                duesOrders.push(order);
            } else if (orderNumber(orderId) >= firstPurimOrderNumber) {
                try {
                    order.teachers = order.teachers.map(teacher => {
                        return { ...teacher, teacherName: faculty[teacher.Id].Name }
                    });
                } catch (e) {
                    console.error(e);
                    console.log(order);
                }
                purimOrders.push(order);
            }
        }
        return { purimOrders, duesOrders }
    }
    function update(orderId, newData) {
        return ref.child(orderId).set(newData);
    }

    return {
        create: create,
        createHanukkahOrder: createHanukkahOrder,
        getAll: getOrders,
        getAsCSV: getAllAsCSV,
        update
    }
})();

// This is how I should have written every single model:

class Order {
    constructor(email, total) {
        const now = new Date();
        this.date = `${now.getMonth()}/${now.getDate()}/${now.getFullYear()}`;
        this.email = email;
        this.total = `$${total}.00`;
        this.ref = firebase.database().ref('Orders');
    }

    async _createOrderId() {
        const snapshot = await ref.orderByKey().limitToLast(1).once('value')
            , lastOrder = snapshot.val()
            , oldId = Object.keys(lastOrder)[0]
            , numString = oldId.slice(3, oldId.length)
            , newNum = String(Number(numString) + 1);

        return `PTA${'0'.repeat(numString.length - newNum.length)}${newNumber}`;
    }

    async save() {
        const id = await this._createOrderId();
        return ref.child(id).set(this.toJSON());
    }

    toJSON() {
        return {
            email: this.email,
            date: this.date,
            total: this.total,
        }
    }
}

class PurimOrder extends Order {
    constructor(teachers) {
        this.teachers = teachers;
    }


    toJSON() {
        return {
            ...super.toJSON(),
            teachers: this.teachers
        }
    }
}
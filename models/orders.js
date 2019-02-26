const firebase = require('firebase');
const ref = firebase.database().ref('Orders');
const promise = require('bluebird');
const writeFile = promise.promisify(require('fs').writeFile);

module.exports = (function () {
    function create(orderInfo) {
        return new Promise(function (resolve, reject) {
            if (orderInfo) {
                getNewOrderId().then(async (newOrderId) => {
                    const infoWithTeachers = await _populateTeachers(orderInfo);
                    ref.child(newOrderId).set(infoWithTeachers);
                    resolve({ ...infoWithTeachers, orderId: newOrderId });
                });
            } else {
                reject('Form not filled out.');
            }
        });
    }
    function createHanukkahOrder(orderInfo) {
        return getNewOrderId().then(newOrderId => {
            ref.child(newOrderId).set({
                orderInfo: { Amount: orderInfo.Amount, Email: orderInfo.Email, Timestamp: orderInfo.Timestamp },
                children: orderInfo.Children
            });
            return newOrderId;
        });
    }
    function populateTeachers(orderInfo) {
        return Promise.all(orderInfo.teachers.map((obj) => {
            return firebase.database().ref('NewFaculty/' + obj.Id).once('value');
        })).then(vals => {
            vals = vals.map(v => { return v.val() });
            console.log(vals);
            vals.forEach((teacher, index) => {
                delete orderInfo.teachers[index].Id;
                orderInfo.teachers[index].teacher = teacher;
            });
        }).then(() => {
            return orderInfo;
        });
    }
    function _populateTeachers(orderInfo) {
        return new Promise(async (resolve, reject) => {
            let teachers = [];
            for (let teacher of orderInfo.teachers) {
                const teacherName = await firebase.database().ref(`FacultyMembers/${teacher.Id}`).once('value').then(s => {
                    return { teacher: s.val().Name, gifter: teacher.gifter }
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
    function getOrdersForHandlebars() {
        return ref.once('value').then(snapshot => {
            const orders = snapshot.val();
            let formattedOrders = []
            for (let orderKey in orders) {
                let newOrder = {
                    orderId: orderKey,
                    orderInfo: [],
                    children: orders[orderKey].children
                }
                for (let key in orders[orderKey].orderInfo) {
                    newOrder.orderInfo.push({
                        key: key,
                        val: orders[orderKey].orderInfo[key]
                    });
                }
                formattedOrders.push(newOrder);
            }
            return formattedOrders
        });
    }

    function getAllAsCSV() {
        return ref.once('value').then(snapshot => {
            const orders = snapshot.val();
            let csvString = 'OrderID,Name,Email,Phone,Address,Amount\n'
            for (let orderKey in orders) {
                const name = orders[orderKey].orderInfo.Name;
                const email = orders[orderKey].orderInfo.Email;
                const phone = orders[orderKey].orderInfo.Phone;
                const address = removeCommasFrom(orders[orderKey].orderInfo.Address);
                const amount = orders[orderKey].orderInfo.Amount;
                const str = `${orderKey},${name},${email},${phone},${address},${amount}\n`
                csvString += str;
            }
            return writeFile(__dirname + '/../orders.csv', csvString);
        });
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
    return {
        create: create,
        createHanukkahOrder: createHanukkahOrder,
        getAll: getOrdersForHandlebars,
        getAsCSV: getAllAsCSV
    }
})();
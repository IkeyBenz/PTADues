const firebase = require('firebase');
const ref = firebase.database().ref('Orders');

module.exports = (function() {
    function create(orderInfo) {
        return new Promise(function(resolve, reject) {
            if (orderInfo) {
                getNewOrderId().then(newOrderId => {
                    ref.child(newOrderId).set(orderInfo);
                    resolve(newOrderId);
                });
            } else {
                reject('Form not filled out.');
            }
        });
    }
    function read() {

    }
    function update() {

    }
    function remove() {

    }
    function getNewOrderId() {
        return new Promise(function(resolve, reject) {
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
    function getAllOrders() {
        return new Promise(function(resolve, reject) {
            ref.once('value').then(snapshot => {
                const orders = snapshot.val();
                if (!orders) return reject('No Orders');
                let formattedOrders = [];
                for (let orderKey in orders) {
                    let children = []
                    for (index in [1,2,3,4,5]) {
                        let childName = orders[orderKey][`child${index}Name`]
                        if (childName != "") {
                            children.push({
                                name: childName,
                                grade: orders[orderKey][`child${index}Grade`]
                            });
                        }
                    } 
                    formattedOrders.push({ ...orders[orderKey], orderId: orderKey, children: children });
                }
                resolve(formattedOrders);
            });
        });
    }

    return {
        create: (orderInfo) => create(orderInfo),
        getAll: getAllOrders
    }
})();
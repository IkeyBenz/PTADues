const firebase = require('firebase');
firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));
const ref = firebase.database().ref('Orders');

function getOrdersForHandlebars() {
    return firebase.database.ref('NewOrders').once('value').then(snapshot => {
        const orders = snapshot.val();
        let formattedOrders = []
        for (let orderKey in orders) {
            formattedOrders.push({
                orderId: orderKey,
                ...orders[orderKey]
            });
        }
        return formattedOrders
    });
}

function restructureOrders() {
    return ref.once('value').then(snapshot => {
        const orders = snapshot.val();
        let restructured = {}
        for (let orderKey in orders) {
            let newOrder = { orderInfo: {}, children: [] }
            for (let key in orders[orderKey]) {
                if (key.slice(0, 5) != 'child') {
                    newOrder.orderInfo[capitalize(key)] = orders[orderKey][key]
                }
            }
            for (let i = 1; i <= 5; i++) {
                if (orders[orderKey][`child${i}Name`] != '') {
                    const newChild = {
                        name: orders[orderKey][`child${i}Name`],
                        grade: orders[orderKey][`child${i}Grade`]
                    }
                    newOrder.children.push(newChild);
                }
            }
            restructured[orderKey] = newOrder;
        }
        restructured['PTA00003'] = fixedOldOrder(orders['PTA00003']);

        return restructured
    });
}
function fixedOldOrder(oldOrder) {
    let newOrder = { orderInfo: {}, children: oldOrder.children }
    for (let key in oldOrder) {
        if (key != 'children') {
            newOrder.orderInfo[capitalize(key)] = oldOrder[key];
        }
    }
    return newOrder
}
async function fix() {
    const oldOrdersSnapshot = await firebase.database().ref('Orders').once('value');
    const oldOrders = oldOrdersSnapshot.val();

    const newOrdersSnapshot = await firebase.database().ref('NewOrders').once('value');
    const newOrders = newOrdersSnapshot.val();

    firebase.database().ref('Orders').set(newOrders);
    firebase.database().ref('OldOrders').set(oldOrders);
    firebase.database().ref('NewOrders').remove();
}

const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
}


const firebase = require('firebase');
firebase.initializeApp(JSON.parse(require('./keys').FIREBASE_CONFIG));
const ref = firebase.database().ref('Orders');

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


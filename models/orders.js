const firebase = require('firebase');
const ref = firebase.database().ref('Orders');

module.exports = (function() {
    function create(orderInfo) {
        return new Promise(function(resolve, reject) {
            if (orderInfo) {
                resolve(ref.push(orderInfo).key);
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

    return {
        create: (orderInfo) => create(orderInfo)
    }
})();
const firebase = require('firebase');
const moment = require('moment-timezone');

class Order {

  static baseDbRef = firebase.database().ref('orders');
  static get = async function(childPath=null) {
    const ref = childPath ? Order.baseDbRef.child(childPath) : Order.baseDbRef;
    return ref.once('value').then(s => s.val());
  }

  static populateTeachers = async function(order, memberPath) {
    const withNames = {}
    try {
      const nameFromId = (id) => Order._getMember(id, memberPath).then(m => m ? m.Name || m.name : 'DELETED');
      for (let childName in order.gifts) {
        const teacherIds = order.gifts[childName];
        withNames[childName] = await Promise.all(teacherIds.map(nameFromId));
      }
    } catch (e) {}
    return { ...order, gifts: withNames };
  }

  static _getMember = (() => {
    const cache = {}
    return async (memberId, path) => {
      !cache[path] && (cache[path] = []);
      if (!(memberId in cache[path]))
        cache[path][memberId] = await firebase.database().ref(path).child(memberId).once('value').then(s => s.val());
      return cache[path][memberId];
    }
  })();

  constructor (parentsName, parentsEmail, amount) {
    if (!parentsName || !parentsEmail || !amount)
      throw Error("Missing required fields for order");
      
    this.parentsName = parentsName;
    this.parentsEmail = parentsEmail;
    this.amount = amount;
    this.timestamp = this._getDate()
  }

  async save() {
    const year = this.timestamp.year;
    const orderType = this.type || 'dues';
    const orderId = await this._getNewOrderId();
    await Order.baseDbRef.child(`${orderType}/${year}/${orderId}`).set(this._repr());
    return { timestamp: this.timestamp, orderId };
  }

  _repr() {
    return {
      parentsName: this.parentsName,
      parentsEmail: this.parentsEmail,
      amount: this.amount,
      timestamp: this.timestamp
    }
  }
  _getNewOrderId() {
    const ref = Order.baseDbRef.child(this.type).child(this.timestamp.year);
    return ref.orderByKey().limitToLast(1).once('value').then(snapshot => {
      if (!(snapshot && snapshot.val())) {
        return 'PTA0001';
      }
      const lastId = Object.keys(snapshot.val())[0];
      return this._incrementOrderId(lastId);
    });
  }
  _incrementOrderId(oldId) {
    let numberString = oldId.slice(3, oldId.length);
    let newNumber = String(Number(numberString) + 1);
    newNumber = '0'.repeat(numberString.length - newNumber.length) + newNumber;
    return 'PTA' + newNumber;
  }
  _getDate() {
    const date = moment(new Date()).tz("America/New_York");
    return {
      year: date.year(),
      month: date.month() + 1,
      day: date.day() + 1,
      time: date.format('h:mma')
    }
  }
}
class HanukahOrder extends Order {
  /** Creates new hanukah order
   * @param {Object<string,string[]>} child_teachers A map of children's names to an array of teacherId's they gifted
   */
  constructor (parentsName, parentsEmail, amount, child_teachers) {
    if (!child_teachers)
      throw Error('Gifts param is required in HanukahOrder');
    super(parentsName, parentsEmail, amount);
    this.gifts = child_teachers;
    this.type = 'hanukah'
  }
  _repr() {
    return {
      ...super._repr(),
      gifts: this.gifts,
    }
  }
}

class HSHanukahOrder extends HanukahOrder {
  constructor (parentsName, parentsEmail, amount, child_teachers) {
    super(parentsName, parentsEmail, amount, child_teachers);
    this.type = 'highschool/hanukah';
  }
  async save() {
    const year = this.timestamp.year;
    const orderType = this.type || 'dues';
    const orderId = await this._getNewOrderId();
    await Order.baseDbRef.child(`${orderType}/${year}/${orderId}`).set(this._repr());
    const giftsWTeachers = await this._populateTeachers(this.gifts);
    return { timestamp: this.timestamp, orderId, giftsWTeachers };
  }

  async _populateTeachers(child_teachers) {
    const memberRef = firebase.database().ref('highschool');
    const nameFromId = (id) => memberRef.child(id).once('value').then(s => s.val().name);
    const withNames = {}
    for (let childName in child_teachers) {
      const teacherIds = child_teachers[childName];
      const teacherNames = await Promise.all(teacherIds.map(nameFromId));
      withNames[childName] = teacherNames;
    }
    return withNames;
  }
}

module.exports = {
  Order,
  HanukahOrder,
  HSHanukahOrder
}
// module.exports = (function () {
//   function create(orderInfo) {
//     return new Promise(function (resolve, reject) {
//       if (orderInfo) {
//         getNewOrderId().then(async (newOrderId) => {
//           ref.child(newOrderId).set(orderInfo);
//           // Only for orders with teachers
//           // Ikey wtf is this? need to fix. Trash.
//           // const infoWithTeachers = await _populateTeachers(orderInfo);

//           resolve({ ...orderInfo, orderId: newOrderId });
//         });
//       } else {
//         reject('Form not filled out.');
//       }
//     });
//   }
//   async function createHanukkahOrder(orderInfo) {
//     const newOrderId = await getNewOrderId();
//     ref.child(newOrderId).set({
//       orderInfo: { Amount: orderInfo.Amount, Email: orderInfo.Email, Timestamp: orderInfo.Timestamp },
//       children: orderInfo.Children
//     });
//     return newOrderId;
//   }
//   function _populateTeachers(orderInfo) {
//     return new Promise(async (resolve, reject) => {
//       let teachers = [];
//       for (let teacher of orderInfo.teachers) {
//         const teacherName = await firebase.database().ref(`FacultyMembers/${teacher.Id}`).once('value').then(s => {
//           return { teacher: s.val().Name, gifter: teacher.gifter, teacherId: teacher.Id }
//         });
//         teachers.push(teacherName);
//       }
//       resolve({ ...orderInfo, teachers })
//     });
//   }
//   function structureOrder(orderDetails) {
//     let children = []
//     for (let i = 1; i <= 5; i++) {
//       if (orderDetails[`child${i}Name`] != "") {
//         children.push({
//           name: orderDetails[`child${i}Name`],
//           grade: orderDetails[`child${i}Grade`]
//         });
//       }
//     }
//     return {
//       orderInfo: {
//         Address: orderDetails.Address,
//         Amount: orderDetails.Amount,
//         Email: orderDetails.Email,
//         Name: orderDetails.Name,
//         Phone: orderDetails.Phone,
//         Timestamp: orderDetails.Timestamp
//       },
//       children: children
//     }
//   }

//   function getNewOrderId() {
//     return new Promise(function (resolve, reject) {
//       ref.orderByKey().limitToLast(1).once('value').then(snapshot => {
//         const lastId = Object.keys(snapshot.val())[0];
//         resolve(fixOrderId(lastId));
//       });
//     });
//   }
//   function fixOrderId(oldId) {
//     let numberString = oldId.slice(3, oldId.length);
//     let newNumber = String(Number(numberString) + 1);
//     newNumber = '0'.repeat(numberString.length - newNumber.length) + newNumber;
//     return 'PTA' + newNumber
//   }
//   async function getOrdersForHandlebars() {
//     const snapshot = await ref.once('value');
//     const orders = snapshot.val();
//     let formattedOrders = [];
//     for (let orderKey in orders) {
//       let newOrder = {
//         orderId: orderKey,
//         orderInfo: [],
//         children: orders[orderKey].children
//       };
//       for (let key in orders[orderKey].orderInfo) {
//         newOrder.orderInfo.push({
//           key: key,
//           val: orders[orderKey].orderInfo[key]
//         });
//       }
//       formattedOrders.push(newOrder);
//     }
//     return formattedOrders;
//   }

//   async function getAllAsCSV() {
//     const snapshot = await ref.once('value');
//     const orders = snapshot.val();
//     let csvString = 'OrderID,Name,Email,Phone,Address,Amount\n';
//     for (let orderKey in orders) {
//       const name = orders[orderKey].orderInfo.Name
//         , email = orders[orderKey].orderInfo.Email
//         , phone = orders[orderKey].orderInfo.Phone
//         , address = removeCommasFrom(orders[orderKey].orderInfo.Address)
//         , amount = orders[orderKey].orderInfo.Amount;

//       csvString += `${orderKey},${name},${email},${phone},${address},${amount}\n`;
//     }
//     return writeFile(__dirname + '/../orders.csv', csvString);
//   }
//   function removeCommasFrom(string) {
//     let newString = '';
//     for (let i = 0; i < string.length; i++) {
//       if (string.charAt(i) != ',') {
//         newString += string.charAt(i);
//       }
//     }
//     return newString
//   }

//   async function getOrders() {
//     const orders = await ref.once('value').then(s => s.val())
//       , faculty = await firebase.database().ref('FacultyMembers').once('value').then(s => s.val())
//       , firstPurimOrderNumber = 69
//       , lastDuesOrderNumber = 57
//       , orderNumber = (str) => Number(str.slice(3));

//     let duesOrders = [];
//     let purimOrders = [];

//     for (let orderId in orders) {
//       let order = { ...orders[orderId], orderId }
//       if (orderNumber(orderId) <= lastDuesOrderNumber) {
//         order.orderInfo = Object.entries(order.orderInfo).map(v => { return { key: v[0], val: v[1] } })
//         duesOrders.push(order);
//       } else if (orderNumber(orderId) >= firstPurimOrderNumber) {
//         try {
//           order.teachers = order.teachers.map(teacher => {
//             return { ...teacher, teacherName: faculty[teacher.Id].Name }
//           });
//         } catch (e) {
//           //console.log(order);
//         }
//         purimOrders.push(order);
//       }
//     }
//     return { purimOrders, duesOrders }
//   }
//   function update(orderId, newData) {
//     return ref.child(orderId).set(newData);
//   }

//   /** Goes through every purim order and creates a spreadsheet that looks like:
//    *  TeacherName,TecherEmailAddress,Kid1,Kid2,Kid3......, named purimOrders.csv */
//   async function createPurimCSV() {
//     const orders = await getOrders().then(o => { return o.purimOrders });
//     const faculty = await facultyRef.once('value').then(s => s.val());
//     let teachers = {}
//     let maxGifterLength = 0;
//     for (let order of orders) {
//       try {
//         for (teacher of order.teachers) {
//           if (teacher.Id in teachers) {
//             teachers[teacher.Id].push(teacher.gifter);
//             if (teachers[teacher.Id].length > maxGifterLength)
//               maxGifterLength = teachers[teacher.Id].length;
//           } else
//             teachers[teacher.Id] = [teacher.gifter];
//         }
//       } catch (e) {
//         console.error(e);
//       }
//     }
//     let csv = 'Name,Email,' + repeatWithIndex(maxGifterLength, 'kid') + '\n';
//     for (let teacherKey in teachers) {
//       csv += `"${faculty[teacherKey].Name}","",`;
//       const arr = teachers[teacherKey].filter(val => val.slice(-12) == ", and family")
//         , parentsName = (arr.length > 0) ? arr[0].slice(0, -12) : 'Anonymous';
//       for (kid of teachers[teacherKey]) {
//         if (kid == '') {
//           csv += `"${parentsName}",`;
//         } else {
//           csv += `"${kid}",`;
//         }
//       }
//       csv += ','.repeat(maxGifterLength - teachers[teacherKey].length) + '\n';
//     }
//     return writeFile(__dirname + '/../purimOrders.csv', csv);
//   }


//   /** Repeats a string count times separated by a comma. Also adds the current index to each string. */
//   function repeatWithIndex(count, str) {
//     let repeated = '';
//     for (let i = 1; i <= count; i++) {
//       repeated += `${str}${i},`;
//     }
//     return repeated;
//   }

//   function getOrdersFromDate(date) {
//     return ref.orderByChild('date').equalTo(date).once('value').then(s => s.val());
//   }

//   async function makeOrdersCSV(orders) {
//     let csv = 'Order#,Date,Email,Total\n';
//     for (orderKey in orders) {
//       csv += `"${orderKey}","${orders[orderKey].date}","${orders[orderKey].email}","${orders[orderKey].total}"\n`;
//     }
//     return writeFile(__dirname + '/../orders.csv', csv);
//   }

//   return {
//     create: create,
//     createHanukkahOrder: createHanukkahOrder,
//     getAll: getOrders,
//     getAsCSV: getAllAsCSV,
//     update,
//     createPurimCSV
//   }
// })();

// // This is how I should have written every single model:

// class Order {
//   constructor(email, total) {
//     const now = new Date();
//     this.date = `${now.getMonth()}/${now.getDate()}/${now.getFullYear()}`;
//     this.email = email;
//     this.total = `$${total}.00`;
//     this.ref = firebase.database().ref('Orders');
//   }

//   async _createOrderId() {
//     const snapshot = await ref.orderByKey().limitToLast(1).once('value')
//       , lastOrder = snapshot.val()
//       , oldId = Object.keys(lastOrder)[0]
//       , numString = oldId.slice(3, oldId.length)
//       , newNum = String(Number(numString) + 1);

//     return `PTA${'0'.repeat(numString.length - newNum.length)}${newNumber}`;
//   }

//   async save() {
//     const id = await this._createOrderId();
//     return ref.child(id).set(this.toJSON());
//   }

//   toJSON() {
//     return {
//       email: this.email,
//       date: this.date,
//       total: this.total,
//     }
//   }
// }

// class PurimOrder extends Order {
//   constructor(teachers) {
//     this.teachers = teachers;
//   }


//   toJSON() {
//     return {
//       ...super.toJSON(),
//       teachers: this.teachers
//     }
//   }
// }
var config = {
    apiKey: "AIzaSyBsW77L5jV4w_GO0wDZRQhaMmRVRdyORLI",
    authDomain: "ptadues.firebaseapp.com",
    databaseURL: "https://ptadues.firebaseio.com",
    projectId: "ptadues",
    storageBucket: "ptadues.appspot.com",
    messagingSenderId: "775577048826"
};
if (firebase.apps.length == 0) {
    firebase.initializeApp(config);
}

const db = firebase.database();
const auth = firebase.auth();
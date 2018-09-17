var config = {
    apiKey: "AIzaSyBsW77L5jV4w_GO0wDZRQhaMmRVRdyORLI",
    authDomain: "ptadues.firebaseapp.com",
    databaseURL: "https://ptadues.firebaseio.com",
    projectId: "ptadues",
    storageBucket: "ptadues.appspot.com",
    messagingSenderId: "775577048826"
};

firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.replace('/admin/login');
    } else {
        console.log('Logged In.');
    }
});
var config = {
    apiKey: "AIzaSyBsW77L5jV4w_GO0wDZRQhaMmRVRdyORLI",
    authDomain: "ptadues.firebaseapp.com",
    databaseURL: "https://ptadues.firebaseio.com",
    projectId: "ptadues",
    storageBucket: "ptadues.appspot.com",
    messagingSenderId: "775577048826"
};
  
firebase.initializeApp(config);
var auth = firebase.auth();

function login() {
    let email = $('#login-email').val();
    let password = $('#login-pass').val();
    if (email && password) {
        auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.replace('/admin/');
        })
        .catch((error) => {
            alert("Something went wrong... " + error.message);
        });
    } else {
        alert('Ensure email and password fields are filled out before continuing.');
    }
}
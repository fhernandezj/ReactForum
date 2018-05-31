import firebase from 'firebase'

const config = {
    apiKey: ",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};
firebase.initializeApp(config);

const ref = firebase.database().ref()
const firebaseAuth = firebase.auth

export function auth (email, pw) {
  return firebaseAuth().createUserWithEmailAndPassword(email, pw)
}

export function logout () {
  return firebaseAuth().signOut()
}

export function login (email, pw) {
  return firebaseAuth().signInWithEmailAndPassword(email, pw)
}

export function resetPassword (email) {
  return firebaseAuth().sendPasswordResetEmail(email)
}

export function saveUser (user) {
  return ref.child(`users/${user.uid}/info`)
    .set({
      email: user.email,
      uid: user.uid
    })
    .then(() => user)
}

export function verify(){
  return firebaseAuth().currentUser.getToken(true);
}

export function currentUser(){
  return firebase.auth().onAuthStateChanged();
}
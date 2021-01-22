import * as firebase from 'firebase'
require('@firebase/firestore')

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDjwqcA5ouD53XbkR61-bncIkNWNaDLh2U",
    authDomain: "wily-3b781.firebaseapp.com",
    projectId: "wily-3b781",
    storageBucket: "wily-3b781.appspot.com",
    messagingSenderId: "1068838193937",
    appId: "1:1068838193937:web:12862039a74c59e26e1ab0"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
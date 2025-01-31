import firebase from 'firebase';

// const firebaseConfig = {
//     apiKey: "AIzaSyBjPOwUI_SeeYtwe6c6ETohRHVJ1agie3U",
//     authDomain: "hopkins-lungs-9c191.firebaseapp.com",
//     databaseURL: "https://hopkins-lungs-9c191-default-rtdb.europe-west1.firebasedatabase.app",
//     projectId: "hopkins-lungs-9c191",
//     storageBucket: "hopkins-lungs-9c191.appspot.com",
//     messagingSenderId: "185239362538",
//     appId: "1:185239362538:web:df1f4d05ef6365391ab093"
  
//   };



// const firebaseConfig = {
//   apiKey: "AIzaSyDxMnsJxPmOlQUkHSm_W8iDw4ZLLfqbhKQ",
//   authDomain: "lung-ai.firebaseapp.com",
//   projectId: "lung-ai",
//   storageBucket: "lung-ai.appspot.com",
//   messagingSenderId: "806819365143",
//   appId: "1:806819365143:web:6c0f1a86b51b442404f752"
// };

const firebaseConfig = {
  "apiKey": "AIzaSyDguVG3pw3iHn-frCjRW5oJPS2CBRs3kmo",
  "authDomain": "chestomx-project.firebaseapp.com",
  "projectId": "chestomx-project",
  "databaseURL": "https://chestomx-project.firebaseio.com",
  "storageBucket": "chestomx-project.appspot.com",
  "messagingSenderId": "725786518603",
  "appId": "1:725786518603:web:00c95916215e2708b3d9ce"
}





  
firebase.initializeApp(firebaseConfig);
  
const  auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const githubProvider = new firebase.auth.GithubAuthProvider();
const googleProvider = new firebase.auth.GoogleAuthProvider();


export {auth, githubProvider, googleProvider , db , storage};
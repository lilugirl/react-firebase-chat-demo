import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


firebase.initializeApp({
  apiKey: "AIzaSyDC5NxzeuQePEegfLpbge5M5EFWzFTMFHs",
  authDomain: "react-chat-demo-bccc2.firebaseapp.com",
  databaseURL: "https://react-chat-demo-bccc2.firebaseio.com",
  projectId: "react-chat-demo-bccc2",
  storageBucket: "react-chat-demo-bccc2.appspot.com",
  messagingSenderId: "135626522572",
  appId: "1:135626522572:web:aced509268e7efc006e769",
  measurementId: "G-Z12CB5TD8H"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>
        {user ? <ChatRoom></ChatRoom> : <SignIn></SignIn>}
      </section>
    </div>
  );
}

function ChatRoom() {
  const dummy = useRef()
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  console.log('messagesRef', messagesRef);
  console.log('query', query);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')

    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <>
      <main>{messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">send</button>
      </form>
    </>
  )
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)

  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}


// function SignOut() {
//   return auth.currentUser && (
//     <button onClick={() => auth.signOut()}>Sign Out</button>
//   )
// }

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return <div className={`message ${messageClass}`}>
    <img src={photoURL} alt="" />
    <p>{text}</p>

  </div>
}

export default App;

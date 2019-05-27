import firebase from "firebase/app";
import "firebase/messaging";

firebase.initializeApp({
  messagingSenderId: "568104192219"
});
const messaging = firebase.messaging();
messaging.onTokenRefresh(updateToken);

export async function initializeFCM() {
  try {
    await messaging.requestPermission();
    await updateToken();
  } catch (error) {
    console.log(error);
  }
}

export default async function updateToken(firebaseInstance = firebase) {
  await firebaseInstance
    .messaging()
    .getToken()
    .then(registerFCMTopic)
    .catch(console.log);
}

function registerFCMTopic(token) {
    return global
      .wretch("/register-fcm-topic")
      .post({ token: token });
}

import firebase from "firebase/app";
import "firebase/messaging";

export async function initializeFCM(messageSenderId) {
  try {
    firebase.initializeApp({
      messagingSenderId: messageSenderId.toString()
    });
    const messaging = firebase.messaging();
    messaging.onTokenRefresh(updateToken);
    await messaging.requestPermission();
    await updateToken();
  } catch (error) {
    console.error(error);
  }
}

export default async function updateToken(firebaseInstance = firebase) {
  await firebaseInstance
    .messaging()
    .getToken()
    .then(registerFCMTopic)
    .catch((error) => { throw new Error("Cannot Update the subscription")});
}

function registerFCMTopic(token) {
    return global
      .wretch("/register-fcm-topic")
      .post({ token: token });
}

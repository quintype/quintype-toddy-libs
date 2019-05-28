import firebase from "firebase/app";
import "firebase/messaging";

export async function initializeFCM(messageSenderId) {
  if (!messageSenderId || isNaN(messageSenderId )){
      console.log("Cannot subscribe to notifications at this moment");
      return;
  }
  try {
    firebase.initializeApp({
      messagingSenderId: messageSenderId.toString()
    });
    const messaging = firebase.messaging();
    await messaging.requestPermission();
    await updateToken();
    messaging.onTokenRefresh(updateToken);
  } catch (error) {
    console.error(error);
  }
}

export default async function updateToken(firebaseInstance = firebase) {
  await firebaseInstance
    .messaging()
    .getToken()
    .then(registerFCMTopic)
    .catch((error) => { throw new Error("Error while updating the subscription token")});
}

function registerFCMTopic(token) {
    return global
      .wretch("/register-fcm-topic")
      .post({ token: token });
}

export async function initializeFCM(messageSenderId) {
  if ( !messageSenderId ){
      console.log("messageSenderId is required");
      return false;
  }
  Promise.all([
    import (/* webpackChunkName: "firebase-app" */ "firebase/app"),
    import(/* webpackChunkName: "firebase-messaging" */ "firebase/messaging")
  ]).then(async ([ firebase, m ]) => {
    try {
        firebase.initializeApp({
          messagingSenderId: messageSenderId.toString()
        });
        const messaging = firebase.messaging();
        await messaging.requestPermission();
        await updateToken(firebase);
        messaging.onTokenRefresh(() => updateToken(firebase));
      } catch (error) {
        console.error(error);
      }
  })
}

export default async function updateToken(firebaseInstance) {
    try {
        const token = await firebaseInstance.messaging().getToken();
        if ( token ) {
            registerFCMTopic(token);
        } else {
            throw new Error ("Could not retrieve token from firebase");
        }
    } catch (error) {
        throw new Error("Error while updating the subscription token");
    }
}

function registerFCMTopic(token) {
    return global
      .wretch("/register-fcm-topic")
      .post({ token: token });
}

/**
 * This namespace handles integration with Firebase Cloud Messaging
 * ```javascript
 * import { initializeFCM } from "@quintype/framework/client/fcm";
 * ```
 * @category Client
 * @module fcm
 */

/**
 * initializeFCM will initialize FCM for sending push notifications.
 * @param {string} messageSenderId The Firebase message sender id
 */
export function initializeFCM(messageSenderId) {
  if ( !messageSenderId ){
      console.log("messageSenderId is required");
      return false;
  }
  Promise.all([
    import (/* webpackChunkName: "firebase-app" */ "firebase/app"),
    import(/* webpackChunkName: "firebase-messaging" */ "firebase/messaging")
  ]).then( ([ firebase, m ]) => {
    try {
        firebase.initializeApp({
          messagingSenderId: messageSenderId.toString()
        });
        const messaging = firebase.messaging();
        messaging.requestPermission()
        .then(() => {
            updateToken(firebase)
            .then(() => {
                messaging.onTokenRefresh(() => updateToken(firebase));
            })
            .catch(console.error);
        })
      } catch (error) {
        console.error(error);
      }
  })
}

function updateToken(firebaseInstance) {
    return firebaseInstance
            .messaging().getToken()
            .then((token) => {
                return registerFCMTopic(token);
            })
            .catch(() => { throw new Error("Could not retrieve token from firebase") });
}

function registerFCMTopic(token) {
    return global
      .wretch("/register-fcm-topic")
      .post({ token: token });
}

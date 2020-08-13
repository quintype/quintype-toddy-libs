export function initializeFCM(messageSenderId) {
  if (!messageSenderId) {
    console.log("messageSenderId is required");
    return false;
  }
  Promise.all([
    import(/* webpackChunkName: "firebase-app" */ "firebase/app"),
    import(/* webpackChunkName: "firebase-messaging" */ "firebase/messaging"),
  ]).then(([firebase, m]) => {
    try {
      firebase.initializeApp({
        messagingSenderId: messageSenderId.toString(),
      });
      const messaging = firebase.messaging();
      messaging.requestPermission().then(() => {
        updateToken(firebase)
          .then(() => {
            messaging.onTokenRefresh(() => updateToken(firebase));
          })
          .catch(console.error);
      });
    } catch (error) {
      console.error(error);
    }
  });
}

function updateToken(firebaseInstance) {
  return firebaseInstance
    .messaging()
    .getToken()
    .then((token) => {
      return registerFCMTopic(token);
    })
    .catch((err) => {
      throw new Error(err);
    });
}

function registerFCMTopic(token) {
  return fetch("/register-fcm-topic", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: token }),
  });
}

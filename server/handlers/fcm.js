const script = `
importScripts('https://www.gstatic.com/firebasejs/5.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.10.0/firebase-app.js');

firebase.initializeApp({
  'messagingSenderId': '149754170748'
});

var messaging = firebase.messaging();
// messaging.usePublicVapidKey("BNL0-mlMQNjloc7RzToVSMq3Mo2WcKcdKcKvdWymxgn7NLnDq8BgwzVUqNTqiA-5IHTtAOgLReMvj-DEXlo9J7I");
messaging.requestPermission().then(function() {
  console.log('Notification permission granted.');
  // TODO(developer): Retrieve an Instance ID token for use with FCM.
}).catch(function(err) {
  console.log('Unable to get permission to notify.', err);
});

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = 'Background Message Title';
  var notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});
`;
 
exports.handleFcm = function handleFcm(res) {
  res.write(script);
}

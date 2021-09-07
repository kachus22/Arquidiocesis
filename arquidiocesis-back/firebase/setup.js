const admin = require('firebase-admin');
const fs = require('fs');

// Check if environment variable for firebase
// auth is available
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceJson = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT,
    'base64'
  ).toString();
  fs.writeFileSync('../ServiceAccountKey.json', serviceJson);
  const serviceAccount = JSON.parse(serviceJson);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Check if firebase auth file is present
  const serviceAccount = require('../ServiceAccountKey');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firebase = admin;
module.exports = firebase;

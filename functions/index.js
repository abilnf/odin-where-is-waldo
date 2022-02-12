// const { deleteField } = require("firebase/firestore");

const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

exports.startSession = functions.firestore
  .document("/sessions/{userId}")
  .onCreate((snap, context) => {
    const data = snap.data();

    const level = data.level;

    return snap.ref.set(
      { image: `where_is_waldo_${level}.png`, startTime: new Date() },
      { merge: true }
    );
  });

exports.giveFeedback = functions.firestore
  .document("/sessions/{userId}")
  .onUpdate((snap, context) => {
    const data = snap.data();

    const level = data.level;
    const guess = data.guess;

    if (guess) {
      const x = guess[0];
      const y = guess[1];

      return admin
        .firestore()
        .collection("levels")
        .doc(level)
        .collection("private")
        .doc("position")
        .get()
        .then((positionDoc) => {
          const position = positionDoc.data();
          const correctX = position.x;
          const correctY = position.y;

          console.log({ x, y });
          console.log({ correctX, correctY });

          return snap.after.ref.update({
            guess: admin.firestore.FieldValue.delete(),
            feedback: true,
          });
        });
    }
  });

// exports.addMessage = functions.https.onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text;
//   // Push the new message into Firestore using the Firebase Admin SDK.
//   const writeResult = await admin
//     .firestore()
//     .collection("messages")
//     .add({ original: original });
//   // Send back a message that we've successfully written the message
//   res.json({ result: `Message with ID: ${writeResult.id} added.` });
// });

// // Listens for new messages added to /messages/:documentId/original and creates an
// // uppercase version of the message to /messages/:documentId/uppercase
// exports.makeUppercase = functions.firestore
//   .document("/messages/{documentId}")
//   .onCreate((snap, context) => {
//     // Grab the current value of what was written to Firestore.
//     const original = snap.data().original;

//     // Access the parameter `{documentId}` with `context.params`
//     functions.logger.log("Uppercasing", context.params.documentId, original);

//     const uppercase = original.toUpperCase();

//     // You must return a Promise when performing asynchronous tasks inside a Functions such as
//     // writing to Firestore.
//     // Setting an 'uppercase' field in Firestore document returns a Promise.
//     return snap.ref.set({ uppercase }, { merge: true });
//   });

// const { deleteField } = require("firebase/firestore");

const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

exports.giveFeedback = functions.firestore
  .document("/sessions/{userId}")
  .onWrite((change, context) => {
    const snap = change.after;
    const data = snap.data();
    if (!data) return;
    const level = data.level;
    if (!level) return;

    functions.logger.log("update");
    if (!data.image) {
      functions.logger.log("setting image paths");
      admin
        .firestore()
        .collection("levels")
        .doc(level)
        .collection("pokemon")
        .get()
        .then((pokemon) =>
          admin
            .firestore()
            .collection("levels")
            .doc(level)
            .collection("private")
            .doc("data")
            .get()
            .then((dataDoc) =>
              snap.ref.set(
                {
                  image: dataDoc.data().image,
                  pokemon: pokemon.docs.map((doc) => ({
                    image: doc.data().image,
                    id: doc.id,
                  })),
                },
                { merge: true }
              )
            )
        )
        .then(() =>
          snap.ref
            .collection("private")
            .doc("data")
            .set({ start: admin.firestore.FieldValue.serverTimestamp() })
        );
    }

    const guess = data.guess;

    if (guess) {
      const x = guess[0];
      const y = guess[1];

      return admin
        .firestore()
        .collection("levels")
        .doc(level)
        .collection("pokemon")
        .doc(guess[2])
        .get()
        .then((positionDoc) => {
          const position = positionDoc.data();

          const correct =
            x >= position.xmin &&
            x <= position.xmax &&
            y >= position.ymin &&
            y <= position.ymax;

          return snap.ref
            .update({
              guess: admin.firestore.FieldValue.delete(),
              feedback: correct,
            })
            .then(() => {
              if (correct) {
                return snap.ref
                  .collection("private")
                  .doc("data")
                  .get()
                  .then((privateData) => {
                    const found = privateData.data().found || [];
                    if (!found.includes(guess[2])) {
                      found.push(guess[2]);
                      const obj = { found };
                      if (found.length === data.pokemon.length) {
                        obj.end = admin.firestore.FieldValue.serverTimestamp();
                      }
                      return snap.ref
                        .collection("private")
                        .doc("data")
                        .set(obj, { merge: true });
                    }
                  });
              }
            });
        });
    }

    if (data.name) {
      return snap.ref
        .collection("private")
        .doc("data")
        .get()
        .then((privateDoc) => {
          const privateData = privateDoc.data();
          const start = privateData.start;
          const end = privateData.end;
          const time = end.toMillis() - start.toMillis();
          return admin
            .firestore()
            .collection("leaderboard")
            .doc(context.params.userId)
            .get()
            .then((userDoc) => {
              const userData = userDoc.data() || { times: {} };
              if (!userData.times[level] || time < userData.times[level]) {
                userData.times[level] = time;
                userData.name = data.name;
                if (data.avatar) {
                  userData.avatar = data.avatar;
                }
                return admin
                  .firestore()
                  .collection("leaderboard")
                  .doc(context.params.userId)
                  .set(userData);
              }
            })
            .then(() => snap.ref.delete());
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

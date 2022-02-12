import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase";

function Play() {
  const params = useParams();

  const [session, loading, error] = useDocumentData(
    doc(db, "sessions", auth.currentUser.uid)
  );

  useEffect(() => {
    if (session) {
      if (session.feedback) {
        console.log(session.feedback);
      }
    }
  }, [session]);

  console.log(session);

  useEffect(() => {
    const sessionRef = doc(db, "sessions", auth.currentUser.uid);
    setDoc(sessionRef, { level: params.levelId });
  }, [params.levelId]);

  return <div>play {params.levelId}</div>;
}

export default Play;

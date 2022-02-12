import { collection, doc, query } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import {
  useCollection,
  useCollectionDataOnce,
  useCollectionOnce,
} from "react-firebase-hooks/firestore";
import styled from "styled-components";
import Level from "../components/Level";
import { db, storage } from "../firebase";

const Layout = styled.h1`
  display: flex;
  flex-flow: row wrap;
  gap: 16px;
  padding: 0 16px 16px 16px;
`;

function Levels(props) {
  const [levels, loading, error] = useCollectionOnce(
    query(collection(db, "levels"))
  );

  const [previewURLs, setPreviewURLs] = useState();

  useEffect(() => {
    if (!levels) return;
    let active = true;
    load();
    return () => {
      active = false;
    };

    async function load() {
      const urls = [];
      for (const level of levels.docs.values()) {
        const res = await getDownloadURL(ref(storage, level.data().preview));
        urls.push(res);
        if (!active) {
          return;
        }
      }

      setPreviewURLs(urls);
    }
  }, [levels]);

  return (
    <Layout>
      {levels &&
        previewURLs &&
        levels.docs.map((level, index) => (
          <Level
            key={level.id}
            name={level.data().name}
            preview={previewURLs[index]}
            onClick={() => props.selectLevel(level.id)}
          />
        ))}
    </Layout>
  );
}

export default Levels;

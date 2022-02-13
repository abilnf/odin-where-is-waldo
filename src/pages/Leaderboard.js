import { collection, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  useCollection,
  useCollectionOnce,
} from "react-firebase-hooks/firestore";
import styled from "styled-components/macro";
import { db } from "../firebase";

const Heading = styled.h1`
  text-align: center;
  color: #ddd;
`;
const LeaderboardContainer = styled.div`
  padding: 16px;
`;

const LeaderboardRow = styled.div`
  display: grid;
  grid-template-columns: 100px 100px 1fr 100px;
  align-items: center;
  border-bottom: 1px solid #bbb;
  padding: 8px;
  height: 4rem;

  &:last-child {
    /* border-bottom: 1px solid #bbb; */
  }
`;

const Avatar = styled.img`
  height: 3rem;
  width: 3rem;
  vertical-align: middle;
  border-radius: 100%;
`;

const Text = styled.p`
  color: #aaa;
  font-size: 1.3rem;
  margin: 0;
`;
const SelectWrapper = styled.div`
  position: relative;
  width: min-content;
  color: #aaa;

  &::after {
    content: "▼";
    font-size: 1rem;
    top: 0.8rem;
    right: 10px;
    position: absolute;
  }
  background-color: #111;
  border-radius: 8px;
`;

const Select = styled.select`
  background-color: transparent;
  color: #aaa;
  font-size: 1.5rem;
  padding: 8px 32px 8px 16px;
  -webkit-appearance: none;
  appearance: none;
  border: 0;
  outline: 0;
`;

const Option = styled.option`
  background-color: #111;
`;

const zeroPad = (num, places) => String(num).padStart(places, "0");

function Leaderboard() {
  const [levels] = useCollectionOnce(query(collection(db, "levels")));

  const [level, setLevel] = useState(null);
  useEffect(() => {
    if (levels) {
      setLevel(levels.docs[0].id);
    }
  }, [levels]);

  const [leaderboard, loading, error] = useCollection(
    query(collection(db, "leaderboard"), orderBy(`times.${level}`, "asc"))
  );

  return (
    <LeaderboardContainer>
      <Heading>Leaderboard</Heading>
      <SelectWrapper>
        <Select onChange={(e) => setLevel(e.target.value)}>
          {levels &&
            levels.docs.map((level, index) => (
              <Option key={level.id} value={level.id}>
                {level.data().name}
              </Option>
            ))}
        </Select>
      </SelectWrapper>
      <LeaderboardRow>
        <Text>Rank</Text>
        <Text>Avatar</Text>
        <Text>Name</Text>
        <Text>Time</Text>
      </LeaderboardRow>
      {leaderboard &&
        level &&
        leaderboard.docs.map((doc, index) => (
          <LeaderboardRow key={doc.id}>
            <Text>{index + 1}</Text>
            {doc.data().avatar ? (
              <Avatar src={doc.data().avatar}></Avatar>
            ) : (
              <div></div>
            )}
            <Text>{doc.data().name}</Text>
            <Text>
              {zeroPad(new Date(doc.data().times[level]).getMinutes(), 2)}:
              {zeroPad(new Date(doc.data().times[level]).getSeconds(), 2)}.
              {zeroPad(
                Math.floor(
                  new Date(doc.data().times[level]).getMilliseconds() / 10
                ),
                2
              )}
            </Text>
          </LeaderboardRow>
        ))}
    </LeaderboardContainer>
  );
}

export default Leaderboard;

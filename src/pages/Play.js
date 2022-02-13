import { deleteField, doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components/macro";
import { auth, db, storage } from "../firebase";
import { nanoid } from "nanoid";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const PokemonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 64px;
`;

const Heading = styled.h1`
  text-align: center;
  color: #ddd;
`;

const Image = styled.img`
  width: 80%;
`;

const Pokemon = styled.img`
  width: 20%;
  object-fit: contain;
  ${(props) =>
    props.found ? "filter: brightness(0) invert(1) brightness(0.3)" : ""};
`;

const Objective = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
`;

const PokemonPopup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  padding: 8px;
  top: ${(props) => props.y}px;
  left: ${(props) => props.x}px;
  background-color: #666;
  border-radius: 16px;
  box-shadow: 0 0 10px black;
`;

const PopupPokemon = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 16px;
  padding: 16px;

  transition: all 150ms ease;
  &:hover {
    background-color: #444;
  }
  &:active {
    background-color: #333;
  }
  cursor: pointer;
  ${(props) =>
    props.found ? "filter: brightness(0) invert(1) brightness(0.3)" : ""};
`;

const WinnerPopupContainer = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  background-color: #0005;
`;

const WinnerPopup = styled.div`
  background-color: #444;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 0 10px black;
`;

const Text = styled.p`
  color: #aaa;
`;

const Input = styled.input`
  font-size: 2rem;
  border: 0;
  border-radius: 8px;
  padding: 8px;
`;
const Button = styled.button`
  font-size: 2rem;
  border: 0;
  border-radius: 8px;
  padding: 8px;
  background-color: #666;
  transition: all 150ms ease;

  &:hover {
    background-color: #777;
  }
  &:active {
    background-color: #555;
  }
`;
const NameRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

// const LoadingTextContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

function Play() {
  const params = useParams();

  const [user, userLoading] = useAuthState(auth);

  const [cookies, setCookie, removeCookie] = useCookies(["customuid"]);

  if (!cookies.customuid) {
    setCookie("customuid", nanoid(28));
  }

  const userID = user
    ? user.uid
    : userLoading
    ? nanoid(28)
    : cookies.customuid || nanoid(28);

  useEffect(() => {
    if (!userLoading) {
      const sessionRef = doc(db, "sessions", userID);
      setDoc(sessionRef, { level: params.levelId });
    }
  }, [userID, userLoading, params.levelId]);

  const [session, loading, error] = useDocumentData(
    doc(db, "sessions", userID)
  );

  const [images, setImages] = useState();
  const [currentGuess, setCurrentGuess] = useState(null);

  const [showWinnerPopup, setShowWinnerPopup] = useState(false);

  if (
    images &&
    images.slice(1).reduce((found, image) => found && image.found, true) &&
    !showWinnerPopup
  ) {
    setShowWinnerPopup(true);
    if (user) {
      const sessionRef = doc(db, "sessions", userID);
      setDoc(
        sessionRef,
        { name: user.displayName, avatar: user.photoURL },
        { merge: true }
      );
    }
  }
  useEffect(() => {
    if (session) {
      if (session.feedback !== undefined) {
        if (session.feedback) {
          setImages(
            images.map((image, index) => {
              if (index === currentGuess.index + 1) {
                image.found = true;
              }
              return image;
            })
          );
        }

        const sessionRef = doc(db, "sessions", userID);
        setDoc(sessionRef, { feedback: deleteField() }, { merge: true });
      }
    }
  }, [userID, session, images, currentGuess]);

  useEffect(() => {
    if (session && session.image && !images) {
      let active = true;
      load();
      return () => {
        active = false;
      };

      async function load() {
        const images = [];

        const image = await getDownloadURL(ref(storage, session.image));
        images.push(image);
        if (!active) {
          return;
        }
        for (const poke of session.pokemon) {
          const pokemon = await getDownloadURL(ref(storage, poke.image));
          images.push({ image: pokemon, id: poke.id });
          if (!active) {
            return;
          }
        }

        setImages(images);
      }
    }
  }, [session, images]);

  const [popup, setPopup] = useState(null);

  function imageClicked(e) {
    const x = e.nativeEvent.offsetX / e.target.width;
    const y = e.nativeEvent.offsetY / e.target.height;

    if (popup) {
      setPopup(null);
    } else {
      setPopup({
        x: e.pageX,
        y: Math.min(e.pageY, document.body.scrollHeight - 350),
      });
      setCurrentGuess({ x, y });
    }
  }

  function doGuess(index) {
    const pokemon = images[index + 1];
    if (!pokemon.found) {
      const sessionRef = doc(db, "sessions", userID);
      setDoc(
        sessionRef,
        { guess: [currentGuess.x, currentGuess.y, pokemon.id] },
        { merge: true }
      );
      setPopup(null);
      setCurrentGuess({ index });
    }
  }

  const navigate = useNavigate();

  function closeWinnerPopup() {
    setShowWinnerPopup(false);
    navigate("/leaderboard");
  }

  const winnerNameInput = useRef();

  function submitWinnerName() {
    const name = winnerNameInput.current.value;
    if (name && name.trim()) {
      const sessionRef = doc(db, "sessions", userID);
      setDoc(sessionRef, { name: name.trim() }, { merge: true });
      closeWinnerPopup();
    }
  }

  if (userLoading) {
    return <Heading>Loading...</Heading>;
  }

  return (
    <div>
      <Heading>Level {params.levelId}</Heading>
      {images && (
        <Container>
          <Objective>
            <Heading>Find the following pokemon:</Heading>
            <PokemonRow>
              {images.slice(1).map((pokemon) => (
                <Pokemon
                  found={pokemon.found}
                  key={pokemon.id}
                  src={pokemon.image}
                  alt={"Pokemon Sprite"}
                />
              ))}
            </PokemonRow>
          </Objective>
          <Image
            onClick={imageClicked}
            src={images[0]}
            alt={"Where is Waldo Puzzle"}
          />
          {popup && (
            <PokemonPopup y={popup.y} x={popup.x}>
              {images.slice(1).map((pokemon, index) => (
                <PopupPokemon
                  found={pokemon.found}
                  key={pokemon.id}
                  src={pokemon.image}
                  alt={"Pokemon Sprite"}
                  onClick={() => doGuess(index)}
                />
              ))}
            </PokemonPopup>
          )}
          {showWinnerPopup && (
            <WinnerPopupContainer onClick={closeWinnerPopup}>
              <WinnerPopup onClick={(e) => e.stopPropagation()}>
                <Heading>Congrats! You found every Pokemon!</Heading>
                {user ? (
                  <Text>Your time was submitted to the leaderboard!</Text>
                ) : (
                  <div>
                    <Text>
                      If you want to submit your time to the leaderboard, please
                      enter a name below:
                    </Text>
                    <NameRow>
                      <Input
                        type="text"
                        placeholder="Name"
                        ref={winnerNameInput}
                      />
                      <Button onClick={submitWinnerName}>Submit</Button>
                    </NameRow>
                  </div>
                )}
              </WinnerPopup>
            </WinnerPopupContainer>
          )}
        </Container>
      )}
    </div>
  );
}

export default Play;

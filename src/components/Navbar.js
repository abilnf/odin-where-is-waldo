import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const StyledLink = styled(Link)`
  color: #bbb;
  text-decoration: none;
  font-size: 2rem;
  border-bottom: 2px solid #bbb0;
  transition: all 150ms ease-in-out;

  &:hover {
    border-bottom: 2px solid #bbb;
  }
`;

const Nav = styled.div`
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 32px;
  padding: 16px;
  border-bottom: 1px solid #888;
  align-items: center;
`;

const LoginView = styled.div`
  display: block;
`;

const Avatar = styled.img`
  height: 2rem;
  width: 2rem;
  vertical-align: middle;
  border-radius: 100%;
`;

const Button = styled.button`
  font-size: 1.6rem;
  border: 0;
  background-color: transparent;
  cursor: pointer;
  color: #bbb;
  vertical-align: middle;
`;

function Navbar(props) {
  const [user, loading, error] = useAuthState(auth);

  return (
    <Nav>
      <StyledLink to="/">LEVELS</StyledLink>
      <StyledLink to="/leaderboard">LEADERBOARD</StyledLink>
      <div></div>
      {user ? (
        <div>
          <Avatar src={user.photoURL}></Avatar>
          <Button onClick={() => signOut(auth)}>LOGOUT</Button>
        </div>
      ) : (
        <div>
          <Button
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
          >
            LOGIN
          </Button>
        </div>
      )}
    </Nav>
  );
}

export default Navbar;

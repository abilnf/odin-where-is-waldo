import styled from "styled-components/macro";

const Background = styled.div`
  background-color: #888;
  padding: 8px;
  cursor: pointer;
`;

const LevelName = styled.h3`
  margin: 0;
  text-align: center;
`;

function Level(props) {
  return (
    <Background onClick={props.onClick}>
      <img src={props.preview} alt="Level Preview" />
      <LevelName>{props.name}</LevelName>
    </Background>
  );
}

export default Level;

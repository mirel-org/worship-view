import styled from "styled-components";

type TextProps = {
  text: string;
};

export const Text = ({ text }: TextProps) => {
  return <StyledText>{text}</StyledText>;
};

const StyledText = styled.span`
  font-family: Inter;
  line-height: 20px;
  font-size: 13px;
  font-weight: 400;
  color: black;
`;

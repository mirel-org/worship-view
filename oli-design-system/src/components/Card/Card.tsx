import { ReactNode } from "react";
import styled from "styled-components";

type CardProps = {
  children: ReactNode;
};

export const Card = ({ children }: CardProps) => {
  return <StyledCard>{children}</StyledCard>;
};

const StyledCard = styled.div`
  border-width: 1px;
  border-radius: 6px;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  border: solid rgb(209, 213, 219);
  width: 100%;
`;

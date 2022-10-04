import { ReactNode } from "react";
import styled from "styled-components";

type TNavbarItem = {
  key: string;
  icon: ReactNode;
  onClick: () => void;
};

type NavbarProps = {
  items: TNavbarItem[];
};

export const Navbar = ({ items }: NavbarProps) => {
  return (
    <Container>
      {items.map((item) => (
        <Item key={item.key} onClick={item.onClick}>
          {item.icon}
        </Item>
      ))}
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
`;

const Item = styled.div`
  width: 60px;
  height: 60px;
  font-family: Inter;
  line-height: 20px;
  font-weight: 400;
  font-size: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  cursor: pointer;
  &:hover {
    background-color: rgb(99, 102, 241);
    color: white;
  }
`;

import styled, { css } from "styled-components";

type TListItem = {
  text: string;
  key: string;
  onClick?: () => void;
};

type ListProps = {
  items: TListItem[];
};

export const List = ({ items }: ListProps) => {
  return (
    <div>
      {items.map((item) => (
        <ListItem
          clickable={!!item.onClick}
          key={item.key}
          onClick={item.onClick}
        >
          {item.text}
        </ListItem>
      ))}
    </div>
  );
};

const ListItem = styled.div<{ clickable: boolean }>`
  font-family: Inter;
  line-height: 20px;
  font-size: 13px;
  font-weight: 400;
  color: black;
  ${(p) =>
    p.clickable &&
    css`
      cursor: pointer;
      &:hover {
        background-color: rgb(99, 102, 241);
        color: white;
      }
    `}
`;

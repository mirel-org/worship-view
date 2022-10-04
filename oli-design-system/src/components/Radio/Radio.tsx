import styled from "styled-components";

type RadioProps = {
  selected: string;
  onChange: (selected: string) => void;
  options: {
    key: string;
    label?: string;
  }[];
};

export const Radio = ({ selected, onChange, options }: RadioProps) => {
  return (
    <div>
      {options.map((option) => (
        <Label key={option.key}>
          <Input
            type="radio"
            value={option.key}
            checked={option.key === selected}
            onChange={(e) => onChange(e.target.value)}
          />
          {option.label}
        </Label>
      ))}
    </div>
  );
};

const Label = styled.div`
  font-family: Inter;
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  color: rgb(70, 70, 70);
`;

const Input = styled.input`
  width: 16px;
  height: 16px;
  border-width: 1px;
  border-radius: 100%;
  box-sizing: border-box;
  border: solid rgb(209, 213, 219);
  outline: none;
  background-origin: border-box;
  display: inline-block;
  margin: 8px 12px 8px 0;
  appearance: none;
  &:focus,
  &:active,
  &:focus-visible {
    outline: 2px solid rgb(99, 102, 241);
    outline-offset: 2px;
  }
  &:checked {
    background-color: rgb(99, 102, 241);
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 16 16' fill='%23fff' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='3'/%3E%3C/svg%3E");
    background-size: 100% 100%;
    border: solid transparent;
  }
`;

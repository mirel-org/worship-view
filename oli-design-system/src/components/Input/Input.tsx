import styled from "styled-components";

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const Input = ({ value, onChange, placeholder }: InputProps) => {
  return (
    <StyledInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
};

const StyledInput = styled.input`
  font-family: Inter;
  line-height: 20px;
  font-size: 13px;
  font-weight: 400;
  background-color: white;
  color: black;
  border-width: 1px;
  border-radius: 6px;
  padding: 8px 16px;
  margin: 0;
  box-sizing: border-box;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  border: solid rgb(209, 213, 219);
  width: 100%;
  outline: none;
  &:focus, &:active, &:focus-visible {
    border: solid rgb(99, 102, 241);
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      rgb(99, 102, 241) 0px 0px 0px 1px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
  }
`;

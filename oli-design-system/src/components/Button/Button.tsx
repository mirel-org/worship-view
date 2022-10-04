import styled from "styled-components";
type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  variant?: ButtonVariant;
  text: string;
  onClick?: () => void;
};

export const Button = ({ variant = "primary", text, onClick }: ButtonProps) => {
  const Btn = variantButtons[variant];
  return (
    <Btn type="button" onClick={onClick}>
      {text}
    </Btn>
  );
};

const PrimaryButton = styled.button`
  font-family: Inter;
  line-height: 20px;
  font-size: 13px;
  font-weight: 600;
  background-color: rgb(79, 70, 229);
  color: white;
  border-width: 0;
  border-radius: 6px;
  padding: 8px 12px;
  margin: 0;
  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    background-color: rgb(99, 102, 241);
  }
`;

const SecondaryButton = styled.button`
  font-family: Inter;
  line-height: 20px;
  font-size: 13px;
  font-weight: 500;
  background-color: white;
  color: rgb(15, 23, 42);
  border-width: 0;
  border-radius: 6px;
  padding: 8px 16px;
  margin: 0;
  box-sizing: border-box;
  cursor: pointer;
  box-shadow: white 0px 0px 0px 0px, rgba(51, 65, 85, 0.1) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  &:hover {
    background-color: rgb(248, 250, 252);
  }
`;

const variantButtons: Record<
  ButtonVariant,
  typeof PrimaryButton | typeof SecondaryButton
> = {
  primary: PrimaryButton,
  secondary: SecondaryButton,
};

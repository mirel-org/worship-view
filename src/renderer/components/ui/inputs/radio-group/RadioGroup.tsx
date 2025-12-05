import React, { ChangeEvent, FC } from 'react';

export type RadioValueType = {
  value: string;
  label: string;
  checked: boolean;
};

export type RadioChangeValueType = (value: string) => void;

type RadioGroupProps = {
  name: string;
  inputs: RadioValueType[];
  onChange: RadioChangeValueType;
};

const RadioGroup: FC<RadioGroupProps> = ({ name, inputs, onChange }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  return (
    <div>
      {inputs.map((input) => (
        <div key={input.value}>
          <input
            type='radio'
            value={input.value}
            name={name}
            checked={input.checked}
            onChange={handleChange}
          />
          {input.label}
        </div>
      ))}
    </div>
  );
};

export default RadioGroup;

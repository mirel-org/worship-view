import { useEffect, useState } from 'react';
import { RadioChangeValueType, RadioValueType } from './RadioGroup';

export const useRadioGroup = (defaultValues: RadioValueType[]) => {
  const [items, setItems] = useState<RadioValueType[]>(defaultValues);

  const onChange: RadioChangeValueType = (value) => {
    const newItems = items.map((item) => ({ ...item, checked: false }));
    const newItem = newItems.find((item) => item.value === value);
    if (!newItem) return;

    newItem.checked = true;
    setItems(newItems);
  };

  return { onChange, items };
};

export type InputGroupsType = {
  [key: string]: RadioValueType[];
};

export const useRadioGroups = (
  inputGroups: InputGroupsType,
  setInputGroups: (input: InputGroupsType) => void,
) => {
  const onChange = (key: string, value: string) => {
    const newInputGroups = { ...inputGroups };
    const newInputGroup = newInputGroups[key];
    if (!newInputGroup) return;

    const newItems = newInputGroup.map((item) => ({ ...item, checked: false }));
    const newItem = newItems.find((item) => item.value === value);
    if (!newItem) return;

    newItem.checked = true;
    newInputGroups[key] = [...newItems];
    setInputGroups(newInputGroups);
  };

  return { onChange };
};

import React from 'react';
import ReactSelect, { Props as SelectProps } from 'react-select';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps extends Omit<SelectProps<SelectOption, true>, 'options'> {
  options: SelectOption[];
}

export const Select: React.FC<CustomSelectProps> = ({ options, ...props }) => {
  return (
    <ReactSelect
      options={options}
      {...props}
      classNamePrefix="select"
    />
  );
};

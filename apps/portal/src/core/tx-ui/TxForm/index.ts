import { TxFormBase, TxFormLabel } from './TxFormBase';
import { TxFormDayPicker, TxFormDayPickerRange } from './TxFormDayPicker';
import { TxFormDropdown, TxFormDropdownMulti } from './TxFormDropdown';
import { TxFormField } from './TxFormField';
import { TxFormFlex } from './TxFormFlex';
import { TxFormInput, TxFormSearchInput } from './TxFormInput';

export * from './TxForm.hook';
export * from './TxForm.theme';
export * from './TxForm.types';

export const TxForm = Object.assign(TxFormBase, {
  Field: TxFormField,
  Flex: TxFormFlex,
  Label: TxFormLabel,
  Input: TxFormInput,
  SearchInput: TxFormSearchInput,
  Dropdown: TxFormDropdown,
  DropdownMulti: TxFormDropdownMulti,
  DayPicker: TxFormDayPicker,
  DayPickerRange: TxFormDayPickerRange,
});

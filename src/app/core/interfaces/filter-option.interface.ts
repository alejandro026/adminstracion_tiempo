import { SelectOption } from './select-option.interface';

export interface FilterOption extends SelectOption{
    sortOptions: SelectOption[];
}

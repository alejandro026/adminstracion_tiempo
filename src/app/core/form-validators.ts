import { AbstractControl, FormControl } from '@angular/forms';

export class FormValidators {
    static noEmpty(control: FormControl) {
        if (control.value.replace(/\s/g, '').length === 0) {
            return {
                empty: true
            };
        }
        return null;
    }

    static noRepeatMember(members: string[]) {
        return (control: AbstractControl) => {
            const repeatMember = members.find(m => m === control.value);
            if (repeatMember) {
                return {
                    memberExist: true
                };
            }
            return null;
        };
    };
}

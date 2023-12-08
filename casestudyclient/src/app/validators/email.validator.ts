import { AbstractControl } from '@angular/forms';
export function ValidateEmail(
  control: AbstractControl
): { invalidEmail: boolean } | null {
  const EMAIL_REGEXP =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return !EMAIL_REGEXP.test(control.value) ? { invalidEmail: true } : null;
} // ValidateEmail

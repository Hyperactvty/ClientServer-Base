import { AbstractControl } from '@angular/forms';
export function ValidatePostalcode(
  control: AbstractControl
): { invalidPostalcode: boolean } | null {
  const POSTALCODE_REGEXP =
  /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  return !POSTALCODE_REGEXP.test(control.value) ? { invalidPostalcode: true } : null;
} // ValidatePostalcode

export interface IValidation {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(input: IValidation) {
  let isValid = true;
  if (input.required) {
    if (typeof input.value === "string") {
      isValid = isValid && input.value.trim().length > 0;
    }
  }
  if (input.minLength && typeof input.value === "string") {
    isValid = isValid && input.value.length >= input.minLength;
  }
  if (input.maxLength && typeof input.value === "string") {
    isValid = isValid && input.value.length >= input.maxLength;
  }
  if (input.min && typeof input.value === "number") {
    isValid = isValid && input.value >= input.min;
  }
  if (input.max && typeof input.value === "number") {
    isValid = isValid && input.value <= input.max;
  }
  return isValid;
}

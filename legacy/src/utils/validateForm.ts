/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from "../components/shared/Form";

export function validateFormFields<T>(
  fields: Field[],
  values: T
): Record<string, string> {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    const value = (values as Record<string, any>)[field.name];

    // Only check required fields (except files, which are optional unless required)
    if (field.type === "file") {
      if (field.required && !value) {
        errors[field.name] = "This image is required.";
      }
    } else if (field.required && (!value || value === "")) {
      errors[field.name] = `${field.label} is required.`;
    }
  });

  return errors;
}

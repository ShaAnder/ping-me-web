import { describe, it, expect } from "vitest";
import { validateFormFields } from "../utils/validateForm";
import type { Field } from "../components/shared/Form";

describe("validateFormFields", () => {
	it("flags a missing required text field", () => {
		const fields: Field[] = [
			{ name: "email", label: "Email", type: "email", required: true },
		];
		const errors = validateFormFields(fields, { email: "" });
		expect(errors.email).toBe("Email is required.");
	});

	it("passes a required field that has a value", () => {
		const fields: Field[] = [
			{ name: "email", label: "Email", type: "email", required: true },
		];
		const errors = validateFormFields(fields, { email: "a@b.com" });
		expect(errors.email).toBeUndefined();
	});

	it("does not flag an optional field that's empty", () => {
		const fields: Field[] = [
			{ name: "bio", label: "Bio", type: "text", required: false },
		];
		const errors = validateFormFields(fields, { bio: "" });
		expect(errors.bio).toBeUndefined();
	});

	it("uses a distinct message for a missing required file field", () => {
		const fields: Field[] = [
			{ name: "avatar", label: "Avatar", type: "file", required: true },
		];
		const errors = validateFormFields(fields, { avatar: null });
		expect(errors.avatar).toBe("This image is required.");
	});

	it("checks every field independently and collects all errors", () => {
		const fields: Field[] = [
			{ name: "username", label: "Username", type: "text", required: true },
			{ name: "email", label: "Email", type: "email", required: true },
		];
		const errors = validateFormFields(fields, { username: "", email: "" });
		expect(Object.keys(errors)).toHaveLength(2);
		expect(errors.username).toBe("Username is required.");
		expect(errors.email).toBe("Email is required.");
	});
});

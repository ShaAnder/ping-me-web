import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form, { Field } from "../components/shared/Form";

describe("Form", () => {
	const fields: Field[] = [
		{ name: "email", label: "Email", type: "email", required: true },
		{ name: "password", label: "Password", type: "password", required: true },
	];

	it("renders a labeled input for each field", () => {
		render(
			<Form
				fields={fields}
				initialValues={{ email: "", password: "" }}
				validate={() => ({})}
				onSubmit={vi.fn()}
				submitLabel="Log In"
			/>,
		);

		expect(screen.getByText("Email")).toBeInTheDocument();
		expect(screen.getByText("Password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
	});

	it("shows validation errors and does not call onSubmit when invalid", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		render(
			<Form
				fields={fields}
				initialValues={{ email: "", password: "" }}
				validate={(values) => {
					const errors: Record<string, string> = {};
					if (!values.email) errors.email = "Email is required";
					if (!values.password) errors.password = "Password is required";
					return errors;
				}}
				onSubmit={onSubmit}
				submitLabel="Log In"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Log In" }));

		await waitFor(() => {
			expect(screen.getByText("Email is required")).toBeInTheDocument();
			expect(screen.getByText("Password is required")).toBeInTheDocument();
		});
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("calls onSubmit with the entered values once valid", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		render(
			<Form
				fields={fields}
				initialValues={{ email: "", password: "" }}
				validate={() => ({})}
				onSubmit={onSubmit}
				submitLabel="Log In"
			/>,
		);

		await user.type(document.getElementById("email")!, "a@b.com");
		await user.type(document.getElementById("password")!, "hunter2");
		await user.click(screen.getByRole("button", { name: "Log In" }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(
				{ email: "a@b.com", password: "hunter2" },
				expect.anything(),
			);
		});
	});

	it("renders the provided footer content", () => {
		render(
			<Form
				fields={fields}
				initialValues={{ email: "", password: "" }}
				validate={() => ({})}
				onSubmit={vi.fn()}
				submitLabel="Log In"
				footer={<div>Forgot your password?</div>}
			/>,
		);

		expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
	});
});

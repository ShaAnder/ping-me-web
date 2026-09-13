import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "../components/shared/Modal";

describe("Modal", () => {
	it("renders title, content, and actions when open", () => {
		render(
			<Modal
				open
				onClose={vi.fn()}
				title="Delete this channel?"
				actions={<button>Delete</button>}
			>
				<p>This cannot be undone.</p>
			</Modal>,
		);

		expect(screen.getByText("Delete this channel?")).toBeInTheDocument();
		expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
	});

	it("renders nothing visible when closed", () => {
		render(
			<Modal open={false} onClose={vi.fn()} title="Hidden">
				<p>You should not see this</p>
			</Modal>,
		);

		expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
	});

	it("calls onClose when the close (X) button is clicked", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(
			<Modal open onClose={onClose} title="Leave Server?">
				<p>Are you sure?</p>
			</Modal>,
		);

		await user.click(screen.getByRole("button", { name: "close" }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onClose on Escape (MUI Dialog default)", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(
			<Modal open onClose={onClose} title="Edit Channel">
				<p>Rename or delete</p>
			</Modal>,
		);

		await user.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});

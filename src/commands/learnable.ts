import { Command } from "commander";
import { createClient } from "../lib/client";
import { printLearnable } from "../lib/format";

export function learnableCommand() {
	return new Command("learnable")
		.description("Get learnable item by ID")
		.argument("<learnable-id>", "Learnable ID")
		.action(async (learnableId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = await client.getLearnable(learnableId);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printLearnable(response);
			}
		});
}

import { Command } from "commander";
import { createClient } from "../lib/client";

export function deleteLevelCommand() {
	return new Command("delete-level")
		.alias("remove-level")
		.description("Delete a level")
		.argument("<level-id>", "Level ID")
		.action(async (levelId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = await client.deleteLevel(levelId);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				console.log(`Success: ${String(response.success)}`);
				console.log(`Deleted level ID: ${String(levelId)}`);
			}
		});
}

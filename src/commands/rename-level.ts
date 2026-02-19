import { Command } from "commander";
import { createClient } from "../lib/client";

export function renameLevelCommand() {
	return new Command("rename-level")
		.alias("set-level-title")
		.description("Rename a level")
		.argument("<level-id>", "Level ID")
		.argument("<new-title>", "New title")
		.action(async (levelId, newTitle, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = await client.setLevelTitle(levelId, newTitle);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				console.log(`Success: ${String(response.success)}`);
				console.log(`Level ID: ${String(levelId)}`);
				console.log(`New title: ${String(newTitle)}`);
			}
		});
}

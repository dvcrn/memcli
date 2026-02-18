import { Command } from "commander";
import { createClient } from "../lib/client";
import { printAddLevel } from "../lib/format";

export function addLevelToCourseCommand() {
	return new Command("add-level-to-course")
		.alias("add-level")
		.description("Add a new level to a course")
		.argument("<course-id>", "Course ID")
		.option("--pool-id <id>", "Pool ID")
		.option("--kind <string>", "Level kind")
		.action(async (courseId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = await client.addLevelToCourse(
				courseId,
				options.poolId,
				options.kind,
			);
			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printAddLevel(response);
			}
		});
}

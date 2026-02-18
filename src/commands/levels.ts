import { Command } from "commander";
import { createClient } from "../lib/client";
import { printLevels } from "../lib/format";

export function levelsCommand() {
	return new Command("levels")
		.alias("course-levels")
		.description("Get levels for a course")
		.argument("<course-id>", "Course ID")
		.option("--include-empty", "Include empty/draft levels")
		.action(async (courseId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = options.includeEmpty
				? await client.getCourseLevelsIncludingEmpty(courseId)
				: await client.getCourseLevels(courseId);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printLevels(response);
			}
		});
}

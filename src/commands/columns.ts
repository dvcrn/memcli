import { Command } from "commander";
import { createClient } from "../lib/client";
import { printColumns } from "../lib/format";

export function columnsCommand() {
	return new Command("columns")
		.alias("course-columns")
		.description("Get columns for a course")
		.argument("<course-id>", "Course ID")
		.action(async (courseId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = await client.getCourseColumns(courseId);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printColumns(response);
			}
		});
}

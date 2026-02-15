import { Command } from "commander";
import { createClient } from "../lib/client";
import { printCourses } from "../lib/format";

export function coursesCommand() {
	return new Command("courses")
		.alias("my-courses")
		.description("List your teaching courses")
		.option("--limit <number>", "Limit for courses", (v) => parseInt(v, 10), 9)
		.option(
			"--offset <number>",
			"Offset for courses",
			(v) => parseInt(v, 10),
			0,
		)
		.action(async (options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = await client.getMyCourses(options.limit, options.offset);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printCourses(response);
			}
		});
}

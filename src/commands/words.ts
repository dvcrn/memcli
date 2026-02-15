import { Command } from "commander";
import { createClient } from "../lib/client";
import { printWords } from "../lib/format";

export function wordsCommand() {
	return new Command("words")
		.alias("items")
		.description("Get words/items in a course or specific level")
		.argument("<course-id>", "Course ID")
		.option("--level <index>", "Level index (1-based)", (v) => parseInt(v, 10))
		.option("--limit <number>", "Limit items", (v) => parseInt(v, 10))
		.action(async (courseId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });

			let response;
			if (options.level !== undefined) {
				if (options.level < 1) {
					throw new Error("Level index must be >= 1");
				}
				// Convert 1-based user input to 0-based for library
				response = await client.getLevelItems(
					courseId,
					options.level - 1,
					options.limit,
				);
			} else {
				response = await client.getCourseItems(courseId, options.limit);
			}

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printWords(response);
			}
		});
}

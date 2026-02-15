import { Command } from "commander";
import { createClient } from "../lib/client";
import { printWords } from "../lib/format";
import { parseIntegerOption } from "../lib/utils";

export function wordsCommand() {
	return new Command("words")
		.alias("items")
		.description("Get words/items in a course or specific level")
		.argument("<course-id>", "Course ID")
		.option(
			"--level <index>",
			"Level index (1-based)",
			parseIntegerOption("--level", { min: 1 }),
		)
		.option(
			"--limit <number>",
			"Limit items",
			parseIntegerOption("--limit", { min: 1 }),
		)
		.action(async (courseId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });

			let response;
			if (options.level !== undefined) {
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

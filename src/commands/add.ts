import { Command } from "commander";
import { createClient } from "../lib/client";
import { printAddThing } from "../lib/format";
import { parseColumns, parseIntegerOption } from "../lib/utils";

export function addThingCourseCommand() {
	return new Command("add-thing-course")
		.alias("add-to-course")
		.description("Add a thing to a course (first level by default)")
		.argument("<course-id>", "Course ID")
		.option(
			"--field <key=value>",
			"Column pair, repeatable",
			(val, memo: string[]) => {
				memo.push(val);
				return memo;
			},
			[],
		)
		.option("--columns <json>", "JSON map of column pairs")
		.option(
			"--level-index <number>",
			"Level index",
			parseIntegerOption("--level-index", { min: 0 }),
			0,
		)
		.action(async (courseId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const columns = parseColumns(options.field, options.columns);
			const response = await client.addThingToCourse(
				courseId,
				columns,
				options.levelIndex,
			);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printAddThing(response);
			}
		});
}

export function addThingLevelCommand() {
	return new Command("add-thing-level")
		.alias("add-to-level")
		.description("Add a thing to a specific level")
		.argument("<level-id>", "Level ID")
		.option(
			"--field <key=value>",
			"Column pair, repeatable",
			(val, memo: string[]) => {
				memo.push(val);
				return memo;
			},
			[],
		)
		.option("--columns <json>", "JSON map of column pairs")
		.action(async (levelId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const columns = parseColumns(options.field, options.columns);
			const response = await client.addThingToLevel(levelId, columns);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printAddThing(response);
			}
		});
}

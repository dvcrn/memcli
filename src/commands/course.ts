import { Command } from "commander";
import { createClient } from "../lib/client";
import { printCourse } from "../lib/format";

export function courseByIdCommand() {
	return new Command("course-by-id")
		.alias("course-id")
		.description("Get course by ID")
		.argument("<course-id>", "Course ID")
		.action(async (courseId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = await client.getCourseById(courseId);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printCourse(response);
			}
		});
}

export function courseBySlugCommand() {
	return new Command("course-by-slug")
		.alias("course-slug")
		.description("Get course by slug")
		.argument("<slug>", "Course slug")
		.action(async (slug, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = await client.getCourseBySlug(slug);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printCourse(response);
			}
		});
}

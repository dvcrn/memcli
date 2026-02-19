#!/usr/bin/env node
import { Command } from "commander";
import { coursesCommand } from "./src/commands/courses";
import { courseByIdCommand, courseBySlugCommand } from "./src/commands/course";
import { levelsCommand } from "./src/commands/levels";
import { columnsCommand } from "./src/commands/columns";
import { wordsCommand } from "./src/commands/words";
import { learnableCommand } from "./src/commands/learnable";
import { getPoolCommand, searchPoolCommand } from "./src/commands/pool";
import {
	addThingCourseCommand,
	addThingLevelCommand,
} from "./src/commands/add";
import { addLevelToCourseCommand } from "./src/commands/add-level";
import { renameLevelCommand } from "./src/commands/rename-level";
import { deleteLevelCommand } from "./src/commands/delete-level";

const program = new Command();

program.name("memcli").description("CLI for Memrise teaching").version("1.0.0");

// Global options
program
	.option("--username <value>", "Memrise username")
	.option("--password <value>", "Memrise password")
	.option("--client-id <value>", "Optional client id")
	.option("-o, --output <mode>", "Output format (text|json)", "text");

// Register commands
program.addCommand(coursesCommand());
program.addCommand(courseByIdCommand());
program.addCommand(courseBySlugCommand());
program.addCommand(levelsCommand());
program.addCommand(columnsCommand());
program.addCommand(wordsCommand());
program.addCommand(learnableCommand());
program.addCommand(getPoolCommand());
program.addCommand(searchPoolCommand());
program.addCommand(addThingCourseCommand());
program.addCommand(addThingLevelCommand());
program.addCommand(addLevelToCourseCommand());
program.addCommand(renameLevelCommand());
program.addCommand(deleteLevelCommand());

async function main() {
	try {
		await program.parseAsync(process.argv);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		} else {
			console.error("Unexpected error", error);
		}
		process.exit(1);
	}
}

main();

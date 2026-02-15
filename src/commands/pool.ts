import { Command } from "commander";
import { createClient } from "../lib/client";
import { printPool, printPoolSearch } from "../lib/format";
import { parseColumns } from "../lib/utils";

export function getPoolCommand() {
	return new Command("get-pool")
		.description("Get pool information")
		.argument("<pool-id>", "Pool ID")
		.action(async (poolId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const response = await client.getPool(poolId);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printPool(response);
			}
		});
}

export function searchPoolCommand() {
	return new Command("search-pool")
		.description("Search pool by column values")
		.argument("<pool-id>", "Pool ID")
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
			"--exclude <id>",
			"Exclude learnable ID, repeatable",
			(val, memo: string[]) => {
				memo.push(val);
				return memo;
			},
			[],
		)
		.option("--original-only", "Restrict pool search to original content")
		.action(async (poolId, options, command) => {
			const globalOptions = command.parent.opts();
			const client = createClient({ ...globalOptions, ...options });
			const columns = parseColumns(options.field, options.columns);
			const response = await client.searchPool(
				poolId,
				columns,
				options.exclude,
				options.originalOnly,
			);

			if (globalOptions.output === "json") {
				console.log(JSON.stringify(response, null, 2));
			} else {
				printPoolSearch(response);
			}
		});
}

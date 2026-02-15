import { MemriseClient } from "memrise";

type OutputMode = "text" | "json";

interface ParsedArgs {
	positional: string[];
	options: Map<string, string[]>;
}

type CommandHandler = (
	client: MemriseClient,
	args: ParsedArgs,
	command: string,
) => Promise<unknown>;

interface CommandRegistry {
	canonical: string;
	handler: CommandHandler;
}

function normalizeOption(name: string): string {
	return name.toLowerCase().replace(/[-_]/g, "");
}

function parseArgs(argv: string[]): ParsedArgs {
	const positional: string[] = [];
	const options = new Map<string, string[]>();

	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (!token?.startsWith("-")) {
			if (token) positional.push(token);
			continue;
		}

		if (token === "--") {
			positional.push(...argv.slice(i + 1));
			break;
		}

		if (token.startsWith("--")) {
			const [rawName, inlineValue] = token.split("=", 2);
			const name = rawName.slice(2);
			let value: string | undefined;

			if (inlineValue !== undefined) {
				value = inlineValue;
			} else {
				const next = argv[i + 1];
				if (next && !next.startsWith("-")) {
					value = next;
					i += 1;
				}
			}

			const values = options.get(name) ?? [];
			values.push(value ?? "true");
			options.set(name, values);
			continue;
		}

		const short = token.slice(1);
		if (!short) continue;
		if (short === "h") {
			options.set("help", ["true"]);
			continue;
		}
		if (short === "f") {
			const next = argv[i + 1];
			const value = next && !next.startsWith("-") ? ((i += 1), next) : undefined;
			const values = options.get("field") ?? [];
			values.push(value ?? "true");
			options.set("field", values);
			continue;
		}
	}

	return { positional, options };
}

function hasOption(args: ParsedArgs, ...names: string[]): boolean {
	const normalized = new Set(names.map(normalizeOption));
	for (const [name, values] of args.options.entries()) {
		if (!normalized.has(normalizeOption(name))) continue;
		if (values.length > 0) return true;
	}
	return false;
}

function getOption(args: ParsedArgs, ...names: string[]): string | null {
	const normalized = new Set(names.map(normalizeOption));
	for (const [name, values] of args.options.entries()) {
		if (!normalized.has(normalizeOption(name))) continue;
		const last = values.at(-1);
		if (!last || last === "true") return null;
		return last;
	}
	return null;
}

function getAllOptionValues(args: ParsedArgs, ...names: string[]): string[] {
	const normalized = new Set(names.map(normalizeOption));
	const values: string[] = [];
	for (const [name, rawValues] of args.options.entries()) {
		if (!normalized.has(normalizeOption(name))) continue;
		values.push(...rawValues.filter((value) => value !== "true"));
	}
	return values;
}

function getAllOptions(args: ParsedArgs, name: string): string[] {
	const values = args.options.get(name);
	return values ?? [];
}

function getOutputMode(args: ParsedArgs): OutputMode {
	const mode = getOption(args, "output-mode", "outputMode", "output");
	return mode === "json" ? "json" : "text";
}

function requireArg(args: ParsedArgs, label: string): string {
	const value = args.positional[0];
	if (!value) {
		throw new Error(`Missing argument: ${label}`);
	}
	return value;
}

function parseColumns(args: ParsedArgs): Record<string, string> {
	const fieldArgs = getAllOptionValues(args, "field");
	const columns: Record<string, string> = {};

	for (const raw of fieldArgs) {
		const sep = raw.indexOf("=");
		if (sep <= 0) {
			throw new Error(`Invalid --field value: "${raw}". Expected KEY=VALUE.`);
		}
		columns[raw.slice(0, sep).trim()] = raw.slice(sep + 1);
	}

	const columnsJson = getOption(args, "columns");
	if (columnsJson) {
		const parsed = JSON.parse(columnsJson);
		if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
			throw new Error("--columns must be a JSON object map, e.g. { \"1\": \"value\" }");
		}
		for (const [key, value] of Object.entries(parsed)) {
			if (typeof value !== "string") {
				throw new Error(`Column value for key ${key} must be a string.`);
			}
			columns[key] = value;
		}
	}

	if (Object.keys(columns).length === 0) {
		throw new Error(
			"No columns provided. Use --field KEY=VALUE (repeatable) or --columns '{\\\"1\\\":\\\"...\\\"}'.",
		);
	}

	return columns;
}

function parseIntOption(args: ParsedArgs, name: string, fallback: number): number {
	const raw = getOption(args, name);
	if (!raw) return fallback;
	const parsed = Number.parseInt(raw, 10);
	if (Number.isNaN(parsed) || parsed < 0) {
		throw new Error(`--${name} must be a non-negative integer`);
	}
	return parsed;
}

function createClientFromEnv(args: ParsedArgs): MemriseClient {
	const username =
		getOption(args, "username") ?? process.env.MEMRISE_USERNAME;
	const password =
		getOption(args, "password") ?? process.env.MEMRISE_PASSWORD;
	const clientId =
		getOption(args, "client-id", "clientId") ?? process.env.MEMRISE_CLIENT_ID;

	if (!username || !password) {
		throw new Error(
			"Missing credentials. Set MEMRISE_USERNAME and MEMRISE_PASSWORD env vars or pass --username/--password.",
		);
	}

	return new MemriseClient(username, password, clientId ?? undefined);
}

function formatProgress(progress: unknown): string {
	if (!progress || typeof progress !== "object") return "";
	const p = progress as Record<string, unknown>;
	const chunks = [
		`learned: ${String(p.learned ?? "n/a")}`,
		`due: ${String(p.due_review ?? "n/a")}`,
		`ignored: ${String(p.ignored ?? "n/a")}`,
		`difficulty: ${String(p.difficult ?? "n/a")}`,
		`percent: ${String(p.percent_complete ?? "n/a")}\%`,
	];
	return ` (${chunks.join(", ")})`;
}

function printTextOutput(command: string, data: unknown): void {
	if (command === "courses") {
		if (!data || typeof data !== "object") {
			console.log("No courses returned.");
			return;
		}

		const payload = data as Record<string, unknown>;
		const courses = Array.isArray(payload.courses) ? payload.courses : [];
		const hasMore = Boolean(payload.has_more_pages);
		console.log(`Courses (${courses.length})`);
		console.log(`Filter: ${String(payload.applied_filter ?? "")}`);
		for (const course of courses) {
			if (!course || typeof course !== "object") continue;
			const c = course as Record<string, unknown>;
			const progress = formatProgress(c.progress);
			console.log(`- ${String(c.name ?? "<unnamed>")} (${String(c.id)})${progress}`);
			console.log(`  slug: ${String(c.slug ?? "")}`);
			console.log(`  official: ${String(c.is_official ?? false)}`);
		}
		if (hasMore) {
			console.log("More pages are available. Use --offset / --limit to page.");
		}
		return;
	}

	if (command === "course-by-id" || command === "course-by-slug") {
		if (!data) {
			console.log("Course not found.");
			return;
		}
		if (typeof data !== "object") {
			console.log(String(data));
			return;
		}
		const course = data as Record<string, unknown>;
		console.log(`${String(course.name ?? "<unnamed>")} (${String(course.id)})`);
		console.log(`Slug: ${String(course.slug ?? "")}`);
		console.log(`Official: ${String(course.is_official ?? false)}`);
		console.log(`Photo: ${String(course.photo_url ?? "")}`);
		if (course.progress && typeof course.progress === "object") {
			console.log(`Progress: ${formatProgress(course.progress)}`);
		}
		return;
	}

	if (command === "course-levels") {
		if (!Array.isArray(data)) {
			console.log("No levels returned.");
			return;
		}
		console.log(`Levels (${data.length})`);
		for (const level of data) {
			if (!level || typeof level !== "object") continue;
			const l = level as Record<string, unknown>;
			console.log(`- ${String(l.title ?? "") || `#${String(l.index)}`}`);
			console.log(`  id: ${String(l.id)} | index: ${String(l.index)} | kind: ${String(l.kind)} | pool: ${String(l.pool_id)}`);
		}
		return;
	}

	if (command === "course-columns") {
		if (!data || typeof data !== "object") {
			console.log("No columns returned.");
			return;
		}
		const columns = data as Record<string, Record<string, unknown>>;
		const entries = Object.entries(columns);
		console.log(`Columns (${entries.length})`);
		for (const [id, configRaw] of entries) {
			if (!configRaw || typeof configRaw !== "object") continue;
			const config = configRaw as Record<string, unknown>;
			console.log(`- [${id}] ${String(config.label ?? "") || "(no label)"}`);
			console.log(`  kind: ${String(config.kind ?? "")}`);
			if (config.typing_strict !== undefined) {
				console.log(`  typing strict: ${String(config.typing_strict)}`);
			}
		}
		return;
	}

	if (command === "words") {
		if (!Array.isArray(data)) {
			console.log("No words returned.");
			return;
		}
		console.log(`Words (${data.length})`);
		for (const item of data) {
			if (!item || typeof item !== "object") continue;
			const i = item as Record<string, unknown>;
			console.log(`- ${String(i.id ?? "?")} : ${String(i.learning_element ?? "")}`);
			console.log(`  definition: ${String(i.definition_element ?? "")}`);
			console.log(`  item type: ${String(i.item_type ?? "")}, difficulty: ${String(i.difficulty ?? "")}`);
		}
		return;
	}

	if (command === "learnable") {
		if (!data) {
			console.log("Learnable not found.");
			return;
		}
		if (typeof data !== "object") {
			console.log(String(data));
			return;
		}
		const l = data as Record<string, unknown>;
		console.log(`Learnable ${String(l.id ?? "?")}`);
		console.log(`Learning: ${String(l.learning_element ?? "")}`);
		console.log(`Definition: ${String(l.definition_element ?? "")}`);
		console.log(`Type: ${String(l.item_type ?? "")}`);
		console.log(`Difficulty: ${String(l.difficulty ?? "")}`);
		return;
	}

	if (command === "get-pool") {
		if (!data || typeof data !== "object") {
			console.log("No pool returned.");
			return;
		}
		const payload = data as Record<string, unknown>;
		const pool = payload.pool && typeof payload.pool === "object" ? (payload.pool as Record<string, unknown>) : null;
		if (!pool) {
			console.log("Pool not found.");
			return;
		}
		console.log(`Pool ${String(pool.id ?? "?")} — ${String(pool.name ?? "<unnamed>")}`);
		console.log(`Can curate: ${String(pool.can_curate ?? false)} | Can moderate: ${String(pool.can_moderate ?? false)}`);
		const columns = typeof pool.columns === "object" ? pool.columns : null;
		const attributes = typeof pool.attributes === "object" ? pool.attributes : null;
		console.log(`Columns: ${columns ? Object.keys(columns as Record<string, unknown>).length : 0}`);
		console.log(`Attributes: ${attributes ? Object.keys(attributes as Record<string, unknown>).length : 0}`);
		return;
	}

	if (command === "search-pool") {
		if (!data || typeof data !== "object") {
			console.log("No search response returned.");
			return;
		}
		const payload = data as Record<string, unknown>;
		const items = Array.isArray(payload.result) ? payload.result : [];
		console.log(`Matches (${items.length})`);
		for (const item of items) {
			if (!item || typeof item !== "object") continue;
			const i = item as Record<string, unknown>;
			console.log(`- id: ${String(i.id ?? "?")}`);
			const cols = i.columns;
			if (cols && typeof cols === "object") {
				for (const [key, value] of Object.entries(cols as Record<string, unknown>)) {
					if (!value || typeof value !== "object") continue;
					const v = (value as Record<string, unknown>).val;
					console.log(`  ${key}: ${String(v ?? "")}`);
				}
			}
		}
		return;
	}

	if (command === "add-thing-course" || command === "add-thing-level") {
		if (!data || typeof data !== "object") {
			console.log("No result returned.");
			return;
		}
		const response = data as Record<string, unknown>;
		console.log(`Success: ${String(response.success ?? false)}`);
		if (response.thing && typeof response.thing === "object") {
			const thing = response.thing as Record<string, unknown>;
			console.log(`Thing ID: ${String(thing.id ?? "?")}`);
			if (thing.columns && typeof thing.columns === "object") {
				const columns = thing.columns as Record<string, unknown>;
				const pairs = Object.entries(columns)
					.map(([k, v]) => {
						if (v && typeof v === "object") {
							return `${k}: ${String((v as Record<string, unknown>).val ?? "")}`;
						}
						return `${k}: ${String(v)}`;
					})
					.join(", ");
				console.log(`Columns: ${pairs}`);
			}
		}
		if (response.rendered_thing !== undefined) {
			console.log(`Rendered: ${String(response.rendered_thing)}`);
		}
		return;
	}

	console.log(JSON.stringify(data, null, 2));
}

async function handleCourses(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const limit = parseIntOption(args, "limit", 9);
	const offset = parseIntOption(args, "offset", 0);
	return client.getMyCourses(limit, offset);
}

async function handleCourseById(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const courseId = requireArg(args, "course-id");
	return client.getCourseById(courseId);
}

async function handleCourseBySlug(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const slug = requireArg(args, "slug");
	return client.getCourseBySlug(slug);
}

async function handleCourseLevels(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const courseId = requireArg(args, "course-id");
	return client.getCourseLevels(courseId);
}

async function handleCourseColumns(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const courseId = requireArg(args, "course-id");
	return client.getCourseColumns(courseId);
}

async function handleWords(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const courseId = requireArg(args, "course-id");
	return client.getCourseItems(courseId);
}

async function handleLearnable(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const learnableId = requireArg(args, "learnable-id");
	return client.getLearnable(learnableId);
}

async function handleGetPool(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const poolId = requireArg(args, "pool-id");
	return client.getPool(poolId);
}

async function handleSearchPool(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const poolId = requireArg(args, "pool-id");
	const columns = parseColumns(args);
	const excludeThingIds = getAllOptionValues(args, "exclude");
	const originalOnly = hasOption(args, "original-only", "originalOnly");
	return client.searchPool(poolId, columns, excludeThingIds, originalOnly);
}

async function handleAddThingCourse(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const courseId = requireArg(args, "course-id");
	const columns = parseColumns(args);
	const levelIndex = parseIntOption(args, "level-index", 0);
	return client.addThingToCourse(courseId, columns, levelIndex);
}

async function handleAddThingLevel(client: MemriseClient, args: ParsedArgs): Promise<unknown> {
	const levelId = requireArg(args, "level-id");
	const columns = parseColumns(args);
	return client.addThingToLevel(levelId, columns);
}

const COMMANDS: Record<string, CommandRegistry> = {
	courses: { canonical: "courses", handler: handleCourses },
	"my-courses": { canonical: "courses", handler: handleCourses },
	"course-by-id": { canonical: "course-by-id", handler: handleCourseById },
	"course-id": { canonical: "course-by-id", handler: handleCourseById },
	"course-by-slug": { canonical: "course-by-slug", handler: handleCourseBySlug },
	"course-slug": { canonical: "course-by-slug", handler: handleCourseBySlug },
	"course-levels": { canonical: "course-levels", handler: handleCourseLevels },
	levels: { canonical: "course-levels", handler: handleCourseLevels },
	"course-columns": { canonical: "course-columns", handler: handleCourseColumns },
	columns: { canonical: "course-columns", handler: handleCourseColumns },
	words: { canonical: "words", handler: handleWords },
	items: { canonical: "words", handler: handleWords },
	learnable: { canonical: "learnable", handler: handleLearnable },
	"get-pool": { canonical: "get-pool", handler: handleGetPool },
	"search-pool": { canonical: "search-pool", handler: handleSearchPool },
	"add-thing-course": {
		canonical: "add-thing-course",
		handler: handleAddThingCourse,
	},
	"add-course": { canonical: "add-thing-course", handler: handleAddThingCourse },
	"add-thing-level": {
		canonical: "add-thing-level",
		handler: handleAddThingLevel,
	},
	"add-level": { canonical: "add-thing-level", handler: handleAddThingLevel },
};

function printUsage(): void {
	console.log(`Usage:
  bun run index.ts <command> [options] [args]

Commands:
  courses                        List your teaching courses
  course-by-id <course-id>       Get course by ID
  course-by-slug <slug>          Get course by slug
  course-levels <course-id>      Get levels for a course
  course-columns <course-id>     Get columns for a course
  words <course-id>              Get words/items in a course
  learnable <learnable-id>       Get learnable item by ID
  get-pool <pool-id>             Get pool information
  search-pool <pool-id>          Search pool by column values
  add-thing-course <course-id>   Add a thing to a course (first level by default)
  add-thing-level <level-id>     Add a thing to a specific level

Global options:
  --username <value>             Memrise username
  --password <value>             Memrise password
  --client-id <value>            Optional client id
  --limit <number>               Limit for courses (default 9)
  --offset <number>              Offset for courses (default 0)
  --level-index <number>         Level index for add-thing-course
  --field KEY=VALUE              Column pair, repeatable
  --columns '{"1":"hello"}'     JSON map of column pairs
  --exclude <id>                 Exclude learnable ID for search-pool, repeatable
  --original-only                Restrict pool search to original content
  --output-mode text|json         Output format (default text)
  --outputMode text|json          Alias
  --help, -h                     Show this help

Examples:
  bun run index.ts courses --output-mode json
  bun run index.ts words 6717539
  bun run index.ts search-pool 12345 --field "1=hello" --output-mode text
  bun run index.ts add-thing-course 6717539 --field "1=hello" --field "2=こんにちは"
`);
}

async function main(): Promise<void> {
	const parsed = parseArgs(process.argv.slice(2));
	const rawCommand = parsed.positional[0];

	if (!rawCommand || hasOption(parsed, "help") || rawCommand === "help") {
		printUsage();
		return;
	}

	const command = COMMANDS[rawCommand] ? COMMANDS[rawCommand] : null;
	if (!command) {
		console.error(`Unknown command: ${rawCommand}`);
		printUsage();
		return;
	}

	try {
		const client = createClientFromEnv(parsed);
		const commandArgs: ParsedArgs = {
			positional: parsed.positional.slice(1),
			options: parsed.options,
		};
		const response = await command.handler(client, commandArgs, command.canonical);
		const outputMode = getOutputMode(commandArgs);

		if (outputMode === "json") {
			console.log(JSON.stringify(response, null, 2));
			return;
		}

		printTextOutput(command.canonical, response);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
			return;
		}
		console.error("Unexpected error", error);
	}
}

await main();

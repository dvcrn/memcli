export function formatProgress(progress: unknown): string {
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

export function printCourses(data: unknown) {
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
		console.log(
			`- ${String(c.name ?? "<unnamed>")} (${String(c.id)})${progress}`,
		);
		console.log(`  slug: ${String(c.slug ?? "")}`);
		console.log(`  official: ${String(c.is_official ?? false)}`);
	}
	if (hasMore) {
		console.log("More pages are available. Use --offset / --limit to page.");
	}
}

export function printCourse(data: unknown) {
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
}

export function printLevels(data: unknown) {
	if (!Array.isArray(data)) {
		console.log("No levels returned.");
		return;
	}
	console.log(`Levels (${data.length})`);
	for (const level of data) {
		if (!level || typeof level !== "object") continue;
		const l = level as Record<string, unknown>;
		console.log(`- ${String(l.title ?? "") || `#${String(l.index)}`}`);
		console.log(
			`  id: ${String(l.id)} | index: ${String(l.index)} | kind: ${String(l.kind)} | pool: ${String(l.pool_id)}`,
		);
	}
}

export function printColumns(data: unknown) {
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
}

function printField(obj: unknown, prefix = "  ") {
	if (obj && typeof obj === "object" && "label" in obj && "value" in obj) {
		const o = obj as { label: string; value: unknown };
		console.log(`${prefix}${o.label}: ${String(o.value ?? "")}`);
	}
}

export function printWords(data: unknown) {
	if (!Array.isArray(data)) {
		console.log("No words returned.");
		return;
	}
	console.log(`Words (${data.length})`);
	for (const item of data) {
		if (!item || typeof item !== "object") continue;
		const i = item as Record<string, unknown>;
		console.log(`- ID: ${String(i.id ?? "?")}`);

		if (i.screens && typeof i.screens === "object") {
			const screens = i.screens as Record<string, Record<string, unknown>>;
			const sortedKeys = Object.keys(screens).sort(
				(a, b) => Number(a) - Number(b),
			);
			for (const key of sortedKeys) {
				const screen = screens[key];

				printField(screen?.item);
				printField(screen?.definition);

				if (Array.isArray(screen?.visible_info)) {
					for (const info of screen.visible_info) {
						printField(info);
					}
				}

				if (Array.isArray(screen?.attributes)) {
					for (const attr of screen.attributes) {
						printField(attr);
					}
				}
			}
		} else {
			// Fallback if screens is missing but legacy fields exist
			if (i.learning_element) {
				console.log(`  Learning: ${String(i.learning_element)}`);
			}
			if (i.definition_element) {
				console.log(`  Definition: ${String(i.definition_element)}`);
			}
		}

		if (i.item_type) {
			console.log(`  Type: ${String(i.item_type)}`);
		}
	}
}

export function printLearnable(data: unknown) {
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
}

export function printPool(data: unknown) {
	if (!data || typeof data !== "object") {
		console.log("No pool returned.");
		return;
	}
	const payload = data as Record<string, unknown>;
	const pool =
		payload.pool && typeof payload.pool === "object"
			? (payload.pool as Record<string, unknown>)
			: null;
	if (!pool) {
		console.log("Pool not found.");
		return;
	}
	console.log(
		`Pool ${String(pool.id ?? "?")} — ${String(pool.name ?? "<unnamed>")}`,
	);
	console.log(
		`Can curate: ${String(pool.can_curate ?? false)} | Can moderate: ${String(pool.can_moderate ?? false)}`,
	);
	const columns = typeof pool.columns === "object" ? pool.columns : null;
	const attributes =
		typeof pool.attributes === "object" ? pool.attributes : null;
	console.log(
		`Columns: ${columns ? Object.keys(columns as Record<string, unknown>).length : 0}`,
	);
	console.log(
		`Attributes: ${attributes ? Object.keys(attributes as Record<string, unknown>).length : 0}`,
	);
}

export function printPoolSearch(data: unknown) {
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
			for (const [key, value] of Object.entries(
				cols as Record<string, unknown>,
			)) {
				if (!value || typeof value !== "object") continue;
				const v = (value as Record<string, unknown>).val;
				console.log(`  ${key}: ${String(v ?? "")}`);
			}
		}
	}
}

export function printAddLevel(data: unknown) {
	if (!data || typeof data !== "object") {
		console.log("No result returned.");
		return;
	}
	const response = data as Record<string, unknown>;
	console.log(`Success: ${String(response.success ?? false)}`);
	if (response.level && typeof response.level === "object") {
		const level = response.level as Record<string, unknown>;
		console.log(`Level ID: ${String(level.id ?? "?")}`);
		console.log(
			`  index: ${String(level.index ?? "?")} | kind: ${String(level.kind ?? "?")} | pool: ${String(level.pool_id ?? "?")}`,
		);
		if (level.title) console.log(`  title: ${String(level.title)}`);
	}
}

export function printAddThing(data: unknown) {
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
}

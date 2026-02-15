export function parseColumns(
	fieldArgs: string[] = [],
	columnsJson?: string,
): Record<string, string> {
	const columns: Record<string, string> = {};

	for (const raw of fieldArgs) {
		const sep = raw.indexOf("=");
		if (sep <= 0) {
			throw new Error(`Invalid --field value: "${raw}". Expected KEY=VALUE.`);
		}
		columns[raw.slice(0, sep).trim()] = raw.slice(sep + 1);
	}

	if (columnsJson) {
		const parsed = JSON.parse(columnsJson);
		if (
			parsed === null ||
			Array.isArray(parsed) ||
			typeof parsed !== "object"
		) {
			throw new Error(
				'--columns must be a JSON object map, e.g. { "1": "value" }',
			);
		}
		for (const [key, value] of Object.entries(parsed)) {
			if (typeof value !== "string") {
				throw new Error(`Column value for key ${key} must be a string.`);
			}
			columns[key] = value;
		}
	}

	return columns;
}

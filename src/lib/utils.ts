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
		let parsed: unknown;
		try {
			parsed = JSON.parse(columnsJson);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Unable to parse --columns JSON: ${error.message}`);
			}
			throw new Error("Unable to parse --columns JSON.");
		}
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

export function parseIntegerOption(
	optionName: string,
	{ min }: { min?: number } = {},
): (value: string) => number {
	return (value: string): number => {
		const normalized = value.trim();
		if (!/^-?\d+$/.test(normalized)) {
			throw new Error(
				`Invalid value for ${optionName}: "${value}". Expected an integer.`,
			);
		}

		const parsed = Number(normalized);
		if (!Number.isSafeInteger(parsed)) {
			throw new Error(
				`Invalid value for ${optionName}: "${value}". Expected a safe integer.`,
			);
		}

		if (min !== undefined && parsed < min) {
			throw new Error(`${optionName} must be >= ${min}.`);
		}

		return parsed;
	};
}

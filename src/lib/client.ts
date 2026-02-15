import { MemriseClient } from "memrise";

export interface ClientOptions {
	username?: string;
	password?: string;
	clientId?: string;
}

export function createClient(options: ClientOptions): MemriseClient {
	const username = options.username ?? process.env.MEMRISE_USERNAME;
	const password = options.password ?? process.env.MEMRISE_PASSWORD;
	const clientId = options.clientId ?? process.env.MEMRISE_CLIENT_ID;

	if (!username || !password) {
		throw new Error(
			"Missing credentials. Set MEMRISE_USERNAME and MEMRISE_PASSWORD env vars or pass --username/--password.",
		);
	}

	return new MemriseClient(username, password, clientId ?? undefined);
}

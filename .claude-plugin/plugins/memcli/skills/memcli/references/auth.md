# Authentication and secrets

`memcli` authenticates against Memrise with a username and password, plus an optional client ID.

## Preferred environment variables

```bash
export MEMRISE_USERNAME="your_username"
export MEMRISE_PASSWORD="your_password"
export MEMRISE_CLIENT_ID="your_client_id"
```

`MEMRISE_CLIENT_ID` is optional. Leave it unset unless the user already relies on a custom client ID.

## Inline credentials

If the user does not want shell-level environment variables, pass credentials directly:

```bash
memcli --username "$MEMRISE_USERNAME" --password "$MEMRISE_PASSWORD" courses
```

Use inline flags carefully because they may appear in shell history or process listings.

## Expected auth error

If credentials are missing, the CLI throws this exact error:

```text
Missing credentials. Set MEMRISE_USERNAME and MEMRISE_PASSWORD env vars or pass --username/--password.
```

## Secret-handling expectations

- Do not commit credentials into the repository.
- Prefer the user’s existing secret manager or shell profile over plaintext files.
- If you need a one-off test, scope the environment variables to a single command where possible.

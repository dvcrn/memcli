# memcli

CLI wrapper for `memrise` (Unofficial Memrise Community Courses API).

## Install

```bash
bun install
```

## Configure credentials

Set credentials via environment variables:

```bash
export MEMRISE_USERNAME="your_username"
export MEMRISE_PASSWORD="your_password"
export MEMRISE_CLIENT_ID="1e739f5e77704b57a703" # optional
```

You can also pass credentials per invocation using `--username` and `--password`.

## Run (authenticated)

```bash
fnox run -- bun run index.ts courses
```

## Output mode

The CLI defaults to text output. If you want raw JSON output, pass
`--output-mode json` (or `--outputMode json`).

```bash
fnox run -- bun run index.ts courses --output-mode text
fnox run -- bun run index.ts words 6717539 --output-mode json
```

## Commands

- `courses` / `my-courses` – list your teaching courses
  - `--limit <n>`
  - `--offset <n>`
- `course-by-id <course-id>` – fetch a course by ID
- `course-by-slug <slug>` – fetch a course by slug
- `course-levels <course-id>` – list course levels
- `course-columns <course-id>` – show course column config
- `words <course-id>` – list words/items in a course
- `learnable <learnable-id>` – fetch one learnable item
- `get-pool <pool-id>` – fetch pool information
- `search-pool <pool-id>` – search a pool
  - `--field <key>=<value>` (repeatable)
  - `--exclude <learnable-id>` (repeatable)
  - `--original-only`
- `add-thing-course <course-id>` – add a thing to a course (first level default)
  - `--field <key>=<value>` (repeatable)
  - `--level-index <n>` (default `0`)
- `add-thing-level <level-id>` – add a thing to a specific level
  - `--field <key>=<value>` (repeatable)

You can also pass `--columns '{"1":"value"}'` in place of repeated `--field` flags.

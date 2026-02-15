# memcli

A CLI for interacting with Memrise community courses

## Install

```bash
npm install -g memcli
# or
bun add -g memcli
```

## Configuration

Set your Memrise credentials via environment variables:

```bash
export MEMRISE_USERNAME="your_username"
export MEMRISE_PASSWORD="your_password"
# Optional
export MEMRISE_CLIENT_ID="your_client_id"
```

Alternatively, you can pass credentials explicitly with `--username` and `--password` flags.

## Examples

**List your teaching courses:**

```bash
memcli courses
```

**List words in a course:**

```bash
memcli words 123456
```

**List words in a specific level (limit to 10 items):**

```bash
memcli words 123456 --level 1 --limit 10
```

**Add a new word to a course:**

```bash
memcli add-to-course 123456 --field "1=Hello" --field "2=Bonjour"
```

**Search a pool for existing items:**

```bash
memcli search-pool 7778482 --field "1=Hello"
```

## Output Mode

The CLI defaults to a human-readable text output. For scripting, use JSON:

```bash
memcli courses --output json
```

## Commands

- `courses` / `my-courses` – List your teaching courses
  - `--limit <n>`
  - `--offset <n>`
- `course-by-id <course-id>` – Fetch course details by ID
- `course-by-slug <slug>` – Fetch course details by slug
- `course-levels <course-id>` – List levels in a course
- `course-columns <course-id>` – Show course column configuration
- `words <course-id>` – List words/items
  - `--level <index>` – List items in a specific level (1-based index)
  - `--limit <n>` – Limit number of items
- `learnable <learnable-id>` – Fetch a single learnable item by ID
- `get-pool <pool-id>` – Fetch pool information
- `search-pool <pool-id>` – Search a pool
  - `--field <key>=<value>` (repeatable)
  - `--exclude <learnable-id>` (repeatable)
  - `--original-only`
- `add-to-course <course-id>` – Add a thing to a course (defaults to first level)
  - `--field <key>=<value>` (repeatable)
  - `--level-index <n>` (default `0`)
- `add-to-level <level-id>` – Add a thing to a specific level ID
  - `--field <key>=<value>` (repeatable)

You can also pass `--columns '{"1":"value"}'` as a JSON string instead of repeated `--field` flags.

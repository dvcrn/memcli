# Usage guidance and failure handling

## Typical workflows

### Find a course, then inspect its structure

1. Run `memcli courses` to list the user’s teaching courses.
2. Pick the target course ID.
3. Run `memcli levels <course-id>` to inspect the level layout.
4. Run `memcli columns <course-id>` before adding or searching items so field keys match the course schema.

### Review course content

Use:

```bash
memcli words <course-id>
memcli words <course-id> --level 1 --limit 10
```

Remember that `--level` is 1-based for the user-facing command.

### Add new content safely

1. Inspect columns first with `memcli columns <course-id>`.
2. Decide whether to target a course-level insertion point or a specific level ID.
3. Use repeated `--field key=value` pairs or `--columns '{"1":"value"}'`.
4. Re-run `memcli words` after the write when feasible.

### Search before adding duplicates

Use `memcli search-pool <pool-id>` before inserting content into a pool-backed workflow, especially when the user wants to avoid duplicate learnables.

## Common failure modes

### Missing IDs

Do not guess IDs. Resolve them with `courses`, `levels`, `course-by-id`, `course-by-slug`, or `get-pool` first.

### Wrong field keys

If the user supplies field names like `"term"` or `"translation"` but the API expects numeric column keys such as `"1"` and `"2"`, check `memcli columns <course-id>` and convert the request to those keys.

### Numeric option errors

The CLI validates integer arguments. Fix invalid values instead of retrying unchanged:

- `--limit >= 1`
- `--offset >= 0`
- `--level >= 1`
- `--level-index >= 0`

### Unclear output requirements

Default output is human-readable text. Use `--output json` when another tool or script needs structured output.

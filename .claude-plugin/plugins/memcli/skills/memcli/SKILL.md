---
name: memcli
description: Use memcli when the user wants to inspect or update Memrise teaching courses, levels, items, or pools through the installed memcli or memrise CLI.
---

# memcli

Use this skill for Memrise teacher and course-maintenance tasks that should be performed with the `memcli` CLI from this repository.

## When to use this skill

Use `memcli` when the user wants to:

- list Memrise teaching courses
- inspect course metadata, columns, levels, words, or a single learnable item
- inspect or search a Memrise pool
- add items to a course or level
- add, rename, or delete course levels

Do not use this skill for generic Memrise learner questions, language-study advice, or tasks that do not require the installed CLI.

## Prerequisites

- The `memcli` binary must be installed and available on `PATH`.
- The `memrise` binary alias may also exist and points to the same executable.
- The user must have Memrise credentials with access to the teaching resources they want to inspect or modify.

## Authentication

- Prefer environment variables over inline credentials:
  - `MEMRISE_USERNAME`
  - `MEMRISE_PASSWORD`
  - `MEMRISE_CLIENT_ID` when the user already has one
- If the user does not want credentials stored in the shell environment, pass `--username` and `--password` directly to the command.
- Read [references/auth.md](references/auth.md) before setting or troubleshooting auth.

## Command selection

- Start with read-only commands when you need to discover IDs before making changes:
  - `courses`
  - `course-by-id`
  - `course-by-slug`
  - `levels`
  - `columns`
  - `words`
  - `learnable`
  - `get-pool`
  - `search-pool`
- Use mutation commands only after you have confirmed the target IDs and fields:
  - `add-thing-course` or `add-to-course`
  - `add-thing-level` or `add-to-level`
  - `add-level-to-course` or `add-level`
  - `rename-level`
  - `delete-level`
- Prefer `--output json` when another tool or script needs to consume the result.

Read [references/commands.md](references/commands.md) for exact invocation patterns.

## Workflow guidance

1. Confirm the CLI is available with `memcli --help` or `memcli <command> --help` if you are unsure about the current command surface.
2. Resolve identifiers before making changes. Typical order:
   - `courses` to find course IDs
   - `levels <course-id>` to find level IDs
   - `columns <course-id>` to confirm field keys before adding or searching items
3. Prefer explicit IDs over guessing from names or slugs.
4. For writes, restate the target resource and intended change, then run the mutation command.
5. Re-run a read command after the change when practical to verify the result.

Read [references/usage.md](references/usage.md) for product-specific workflows and failure handling.

## Failure guidance

- If the CLI returns `Missing credentials`, configure `MEMRISE_USERNAME` and `MEMRISE_PASSWORD` or pass `--username` and `--password`.
- If a command rejects a numeric option such as `--limit`, `--offset`, `--level`, or `--level-index`, fix the value before retrying:
  - `--limit` must be `>= 1`
  - `--offset` must be `>= 0`
  - `--level` is 1-based and must be `>= 1`
  - `--level-index` is 0-based and must be `>= 0`
- If a write command fails, verify the course, level, learnable, or pool ID with a read command first.
- If adding or searching by fields fails, verify the course columns and match the field keys exactly.

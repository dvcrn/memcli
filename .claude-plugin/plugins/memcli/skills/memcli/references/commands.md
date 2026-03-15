# memcli command cookbook

Use `memcli` unless the environment only exposes the `memrise` alias.

## Global flags

- `--username <value>`
- `--password <value>`
- `--client-id <value>`
- `-o, --output text|json`

## Read-only commands

List your teaching courses:

```bash
memcli courses
memcli courses --limit 20 --offset 0
memcli courses --output json
```

Get a course:

```bash
memcli course-by-id 123456
memcli course-by-slug my-course-slug
```

Inspect structure and items:

```bash
memcli levels 123456
memcli levels 123456 --include-empty
memcli columns 123456
memcli words 123456
memcli words 123456 --level 1 --limit 10
memcli learnable 987654321
```

Inspect or search a pool:

```bash
memcli get-pool 7778482
memcli search-pool 7778482 --field "1=Hello"
memcli search-pool 7778482 --field "1=Hello" --exclude 987654321
memcli search-pool 7778482 --columns '{"1":"Hello","2":"Bonjour"}'
memcli search-pool 7778482 --original-only
```

## Write commands

Add an item to a course or a specific level:

```bash
memcli add-to-course 123456 --field "1=Hello" --field "2=Bonjour"
memcli add-to-course 123456 --columns '{"1":"Hello","2":"Bonjour"}' --level-index 0
memcli add-to-level 16267521 --field "1=Hello" --field "2=Bonjour"
```

Add or modify levels:

```bash
memcli add-level 123456
memcli add-level 123456 --pool-id 7778482 --kind normal
memcli rename-level 16267521 "02/19"
memcli delete-level 16267524
```

## Command aliases

- `my-courses` -> `courses`
- `course-id` -> `course-by-id`
- `course-slug` -> `course-by-slug`
- `course-levels` -> `levels`
- `course-columns` -> `columns`
- `items` -> `words`
- `add-to-course` -> `add-thing-course`
- `add-to-level` -> `add-thing-level`
- `add-level` -> `add-level-to-course`
- `remove-level` -> `delete-level`
- `set-level-title` -> `rename-level`

Prefer the more descriptive canonical command names when clarity matters in shared transcripts.

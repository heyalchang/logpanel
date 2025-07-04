# Database Schema

## Table: `logs`
| Column       | Type        | Constraints                | Description                                |
|--------------|------------|----------------------------|--------------------------------------------|
| `id`         | `bigserial` | PRIMARY KEY                | Auto-incrementing unique row identifier    |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | When the log was inserted                  |
| `level`      | `text`       | NOT NULL                   | One of `INFO`, `WARN`, `ERROR`             |
| `message`    | `text`       | NOT NULL                   | Human-readable message                     |
| `data`       | `jsonb`      | nullable                   | Structured metadata / payload             |
| `run_id`     | `text`       | NOT NULL                   | Groups logs that belong to the same run    |

### Additional Notes
* `run_id` is generated by the client or demo tools as `<scenario>-<ISO-timestamp-to-second>` (e.g. `web-server-2025-07-02T12-34-56`).
* You can create an index on `run_id` for faster filtering:
  ```sql
  create index if not exists logs_run_id_idx on logs(run_id);
  ```
* Typical queries:
  ```sql
  -- fetch all logs for a run
  select * from logs where run_id = 'web-server-2025-07-02T12-34-56' order by created_at;

  -- count errors per run
  select run_id, count(*) filter (where level = 'ERROR') as error_count
  from logs
  group by run_id;
  ```

---

## Table: `users` *(optional / experimental)*
| Column      | Type    | Constraints  | Description              |
|-------------|---------|--------------|--------------------------|
| `id`        | `serial`| PRIMARY KEY  | Auto-incrementing id     |
| `username`  | `text`  | UNIQUE, NOT NULL | Login / display name |
| `password`  | `text`  | NOT NULL     | Hashed password          |

> The current application does not yet use authentication; the `users` table is included for future expansion. 
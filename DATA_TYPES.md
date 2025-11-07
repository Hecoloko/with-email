# Data Types and Structures

This document outlines the core data structures used in the Applicant Tracking Kanban Board application, as defined in `types.ts`.

---

## Main Data Structure

### `Applicant`

This is the central interface, representing a single job applicant in the system.

| Property      | Type             | Description                                                   |
|---------------|------------------|---------------------------------------------------------------|
| `id`          | `string`         | A unique identifier for the applicant.                        |
| `name`        | `string`         | The full name of the applicant.                               |
| `role`        | `string`         | The job role the applicant is applying for.                   |
| `avatar_url`  | `string`         | A URL to the applicant's profile picture or avatar.           |
| `stage`       | `Stage`          | The applicant's current stage in the hiring pipeline.         |
| `assigned_to_id`| `string?`        | The ID of the `TeamMember` assigned to this applicant.        |
| `interview_date`| `string?`       | An ISO 8601 string for a scheduled interview date and time.   |
| `notes`       | `Note[]?`        | An array of notes related to the applicant.                   |
| `tasks`       | `Task[]?`        | An array of tasks associated with the applicant's profile.    |
| `attachments` | `Attachment[]?`  | An array of file attachments, such as resumes or portfolios.  |
| `email`       | `string?`        | The applicant's email address.                                |
| `phone`       | `string?`        | The applicant's phone number.                                 |
| `created_by`  | `string?`        | The ID of the user who created the record.                    |

---

## Supporting Data Structures

### `TeamMember`

Represents a member of the hiring team who can be assigned to applicants or tasks.

| Property    | Type     | Description                                |
|-------------|----------|--------------------------------------------|
| `id`        | `string` | A unique identifier for the team member.   |
| `name`      | `string` | The full name of the team member.          |
| `avatar_url`| `string` | A URL to the team member's avatar image.   |

### `Task`

Represents a single, actionable task related to an applicant (e.g., "Review portfolio").

| Property       | Type         | Description                                                |
|----------------|--------------|------------------------------------------------------------|
| `id`           | `string`     | A unique identifier for the task.                          |
| `description`  | `string`     | The content or description of the task.                    |
| `status`       | `TaskStatus` | The current status of the task.                            |
| `created_at`   | `string`     | An ISO 8601 string representing when the task was created. |
| `assigned_to_id` | `string?`    | The ID of the `TeamMember` this task is assigned to.       |
| `applicant_id` | `string?`    | Foreign key linking to the `Applicant`.                    |
| `created_by`   | `string?`    | The ID of the user who created the task.                   |


### `Note`

Represents a note or comment made about an applicant during the hiring process.

| Property   | Type     | Description                                                     |
|------------|----------|-----------------------------------------------------------------|
| `id`       | `string` | A unique identifier for the note.                               |
| `content`  | `string` | The text content of the note.                                   |
| `created_at`| `string` | An ISO 8601 string representing when the note was created.      |
| `applicant_id` | `string?` | Foreign key linking to the `Applicant`.                    |
| `created_by`| `string?` | The ID of the user who created the note.                      |

### `Attachment`

Represents a file (e.g., resume, cover letter, portfolio link) attached to an applicant's profile.

| Property    | Type     | Description                                   |
|-------------|----------|-----------------------------------------------|
| `id`        | `string` | A unique identifier for the attachment.       |
| `file_name` | `string` | The original name of the uploaded file.       |
| `url`       | `string` | The URL to access the file.                   |
| `mime_type` | `string` | The MIME type of the file (e.g., 'application/pdf'). |
| `applicant_id`| `string?` | Foreign key linking to the `Applicant`.    |
| `created_by`| `string?` | The ID of the user who created the attachment.|
| `bucket`    | `string?` | The name of the storage bucket.               |
| `object_path`| `string?` | The path to the file object in the bucket.    |

---

## Enumerated Types

These types define a specific set of allowed string values for certain properties.

### `Stage`

Represents the distinct stages in the hiring pipeline. An applicant can only be in one stage at a time.

**Possible Values:**
- `'Applied'`
- `'Screening'`
- `'Interview'`
- `'Offer'`
- `'Hired'`
- `'Rejected'`

### `TaskStatus`

Represents the completion status of a `Task`.

**Possible Values:**
- `'To Do'`
- `'In Progress'`
- `'Done'`

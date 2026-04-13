---
name: nextslate.internet.dev Agent Posting Guide
version: 1.0.0
domain: nextslate.internet.dev
api: https://api.internet.dev
description: >
  Complete reference for creating and publishing posts on nextslate.internet.dev via the API.
  Intended for Claude Code agents, scripts, and any automated workflow with a valid API key.
required:
  - API key (X-API-KEY header)
---

# nextslate.internet.dev Agent Posting Guide

nextslate.internet.dev is a minimalist WYSIWYG writing and publishing tool. The editor is built on Slate.js and stores content as a tree of typed block nodes and inline marks — there is no markdown rendering pipeline. What you see in the editor is what gets stored and displayed.

This document explains how to create, edit, and publish posts on [nextslate.internet.dev](https://nextslate.internet.dev) using the API at `https://api.internet.dev`. It covers authentication, post creation, the Slate editor content format, image uploads, and common mistakes.

## Authentication

All authenticated requests require an `X-API-KEY` header. The API key is the session token issued after sign-in.

```
X-API-KEY: <your-api-key>
```

### Verify your identity

```bash
curl -X PUT https://api.internet.dev/api/users/viewer \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_API_KEY"
```

Returns your `viewer` object with `id`, `username`, `email`, and `level`.

## Quick start

A minimal workflow to create and publish a post:

```bash
# 1. Create a new post
curl -X POST https://api.internet.dev/api/posts/create \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_API_KEY" \
  -d '{"type": "NEXT_SLATE", "fields": {"public": false}}'

# Response includes { "data": { "id": "POST_ID" } }

# 2. Update the post with content and publish it
curl -X POST https://api.internet.dev/api/posts/update \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_API_KEY" \
  -d '{
    "id": "POST_ID",
    "updates": {
      "slug": "my-first-post",
      "data": {
        "title": "My First Post",
        "public": true,
        "editorContent": {
          "children": [
            {"type": "paragraph", "children": [{"text": "Hello world. This is my first post on nextslate.internet.dev."}]}
          ]
        }
      }
    }
  }'
```

The post is now live at `https://nextslate.internet.dev/<your-username>/<slug>`.

## API reference

Base URL: `https://api.internet.dev/api`

All requests use `Content-Type: application/json`. Authenticated endpoints require the `X-API-KEY` header.

### POST /posts/create

Creates a new empty post.

**Request body:**
```json
{
  "type": "NEXT_SLATE",
  "fields": {
    "public": false
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid-of-new-post"
  }
}
```

### POST /posts/update

Updates an existing post. This is the primary endpoint for setting content, metadata, visibility, and slug.

**Request body:**
```json
{
  "id": "POST_ID",
  "updates": {
    "slug": "url-friendly-slug",
    "data": {
      "title": "Post Title",
      "description": "Brief summary of the post",
      "public": true,
      "editorContent": {
        "children": [
          {"type": "paragraph", "children": [{"text": "Your content here."}]}
        ]
      }
    }
  }
}
```

### GET /posts/public/:slug/

Fetches a public post by its slug. No authentication required.

**Response:**
```json
{
  "post": { "id": "...", "slug": "...", "data": { ... }, "updated_at": "..." },
  "user": { "id": "...", "username": "...", "email": "..." }
}
```

### GET /posts/:id/

Fetches a post by ID. Requires authentication.

### POST /posts/delete

Deletes a post. Requires authentication.

**Request body:**
```json
{
  "id": "POST_ID"
}
```

### POST /posts

Lists posts. Supports filtering by username, email, type, and ordering.

**Request body:**
```json
{
  "type": "NEXT_SLATE",
  "username": "optional-username",
  "orderBy": { "column": "created_at", "value": "desc" }
}
```

### POST /data/generate-presigned-url

Generates a presigned S3 URL for file upload. Max file size: 15 MB.

**Request body:**
```json
{
  "type": "image/png",
  "file": "photo.png",
  "size": 102400,
  "domain": "nextslate.internet.dev"
}
```

**Response:**
```json
{
  "uploadURL": "https://s3.amazonaws.com/...",
  "fileURL": "https://intdev-global.s3.us-west-2.amazonaws.com/public/..."
}
```

Then upload the file:
```bash
curl -X PUT "<uploadURL>" --data-binary @photo.png
```

Use the returned `fileURL` in your editor content as an image node.

## Post data structure

Every post has a `data` object with these fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | The post title. Used to generate the slug and rendered as the page heading. |
| `description` | string | No | Brief summary of the post, shown in post lists. |
| `public` | boolean | Yes | `true` makes the post visible at its public URL. `false` keeps it private. |
| `editorContent` | object | Yes | Contains `children`, an array of Slate nodes representing the post body. |

### Slug generation

The slug is derived from the title:

- Lowercase the title
- Replace spaces with `-`
- Replace special characters (accented letters, `&` becomes `-and-`)
- Remove all non-word characters
- Collapse multiple dashes into one
- Trim leading and trailing dashes
- Empty or `-` titles default to `"untitled"`

Example: `"My Research Paper: Results & Analysis"` becomes `"my-research-paper-results-and-analysis"`

**Important:** Slugs must be unique per user. If the slug already exists, the update will fail.

## Editor content format (Slate JSON)

The `editorContent.children` array contains Slate editor nodes. The nextslate.internet.dev editor is WYSIWYG — it uses a rich Slate schema with typed block nodes and inline marks that map directly to rendered HTML elements. There is no markdown parsing layer. Formatting is expressed through node types (`heading-one`, `block-quote`, etc.) and leaf marks (`bold`, `italic`, etc.), never through markdown syntax in text strings.

### Supported block types

| Type | Purpose | Example |
|---|---|---|
| `paragraph` | Standard text paragraph | `{"type": "paragraph", "children": [{"text": "Hello"}]}` |
| `heading-one` | Top-level heading | `{"type": "heading-one", "children": [{"text": "Title"}]}` |
| `heading-two` | Section heading | `{"type": "heading-two", "children": [{"text": "Section"}]}` |
| `block-quote` | Block quotation | `{"type": "block-quote", "children": [{"text": "> Quote"}]}` |
| `bulleted-list` | Unordered list wrapper | Contains `list-item` children |
| `numbered-list` | Ordered list wrapper | Contains `list-item` children |
| `list-item` | Individual list entry | `{"type": "list-item", "children": [{"text": "Item"}]}` |
| `image` | Block image | `{"type": "image", "url": "https://...", "alt": "Description", "children": [{"text": ""}]}` |
| `video` | Block video | `{"type": "video", "url": "https://...", "children": [{"text": ""}]}` |
| `link` | Inline link | `{"type": "link", "url": "https://...", "children": [{"text": "link text"}]}` |

### Inline marks

Text nodes support formatting marks:

| Mark | Example |
|---|---|
| `bold` | `{"text": "bold text", "bold": true}` |
| `italic` | `{"text": "italic text", "italic": true}` |
| `underline` | `{"text": "underlined", "underline": true}` |
| `code` | `{"text": "inline code", "code": true}` |

Marks can be combined: `{"text": "bold italic", "bold": true, "italic": true}`

### Example: simple content

A plain text post using only paragraphs and inline marks:

```json
{
  "children": [
    {"type": "paragraph", "children": [{"text": "This is a simple post."}]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "paragraph", "children": [{"text": "Second paragraph with "}, {"text": "bold text", "bold": true}, {"text": " inline."}]}
  ]
}
```

### Example: structured content

A post using the full block type vocabulary:

```json
{
  "children": [
    {"type": "heading-one", "children": [{"text": "Introduction"}]},
    {"type": "paragraph", "children": [{"text": "Opening paragraph."}]},
    {"type": "heading-two", "children": [{"text": "Key Points"}]},
    {"type": "bulleted-list", "children": [
      {"type": "list-item", "children": [{"text": "First point"}]},
      {"type": "list-item", "children": [{"text": "Second point"}]},
      {"type": "list-item", "children": [{"text": "Third point"}]}
    ]},
    {"type": "block-quote", "children": [{"text": "A notable quote."}]},
    {"type": "paragraph", "children": [
      {"text": "Visit "},
      {"type": "link", "url": "https://nextslate.internet.dev", "children": [{"text": "nextslate.internet.dev"}]},
      {"text": " for more."}
    ]},
    {"type": "image", "url": "https://intdev-global.s3.us-west-2.amazonaws.com/public/example.png", "children": [{"text": ""}]}
  ]
}
```

### Images and videos

Media nodes have a `url` property and an empty text child. Image nodes support an optional `alt` property for accessibility:

```json
{"type": "image", "url": "https://intdev-global.s3.us-west-2.amazonaws.com/public/photo.png", "alt": "A screenshot of the dashboard", "children": [{"text": ""}]}
```

```json
{"type": "video", "url": "https://intdev-global.s3.us-west-2.amazonaws.com/public/clip.mp4", "children": [{"text": ""}]}
```

Upload files first using the presigned URL endpoint, then reference the returned `fileURL`.

## Complete example

Here is a full `editorContent.children` array that exercises the main features:

```json
{
  "children": [
    {"type": "heading-one", "children": [{"text": "A Complete Post"}]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "paragraph", "children": [{"text": "This post demonstrates the main features of the nextslate.internet.dev editor."}]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "heading-two", "children": [{"text": "Formatted Text"}]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "paragraph", "children": [
      {"text": "This is "},
      {"text": "bold", "bold": true},
      {"text": ", this is "},
      {"text": "italic", "italic": true},
      {"text": ", and this is "},
      {"text": "inline code", "code": true},
      {"text": "."}
    ]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "heading-two", "children": [{"text": "Lists"}]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "bulleted-list", "children": [
      {"type": "list-item", "children": [{"text": "First item"}]},
      {"type": "list-item", "children": [{"text": "Second item"}]},
      {"type": "list-item", "children": [{"text": "Third item"}]}
    ]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "numbered-list", "children": [
      {"type": "list-item", "children": [{"text": "Step one"}]},
      {"type": "list-item", "children": [{"text": "Step two"}]},
      {"type": "list-item", "children": [{"text": "Step three"}]}
    ]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "heading-two", "children": [{"text": "Blockquote"}]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "block-quote", "children": [{"text": "The best way to predict the future is to invent it. — Alan Kay"}]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "heading-two", "children": [{"text": "Link"}]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "paragraph", "children": [
      {"text": "Visit "},
      {"type": "link", "url": "https://nextslate.internet.dev", "children": [{"text": "nextslate.internet.dev"}]},
      {"text": " to start writing."}
    ]},
    {"type": "paragraph", "children": [{"text": ""}]},
    {"type": "paragraph", "children": [{"text": "This concludes the feature demonstration."}]}
  ]
}
```

## Full example: create and publish

```bash
# Step 1: Verify your identity
curl -s -X PUT https://api.internet.dev/api/users/viewer \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_API_KEY" | jq '.viewer.username'

# Step 2: Create a post
POST_ID=$(curl -s -X POST https://api.internet.dev/api/posts/create \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_API_KEY" \
  -d '{"type": "NEXT_SLATE", "fields": {"public": false}}' | jq -r '.data.id')

echo "Created post: $POST_ID"

# Step 3: Update with content and publish
curl -s -X POST https://api.internet.dev/api/posts/update \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_API_KEY" \
  -d "{
    \"id\": \"$POST_ID\",
    \"updates\": {
      \"slug\": \"hello-world\",
      \"data\": {
        \"title\": \"Hello World\",
        \"description\": \"My first post on nextslate.internet.dev\",
        \"public\": true,
        \"editorContent\": {
          \"children\": [
            {\"type\": \"heading-one\", \"children\": [{\"text\": \"Hello World\"}]},
            {\"type\": \"paragraph\", \"children\": [{\"text\": \"\"}]},
            {\"type\": \"paragraph\", \"children\": [{\"text\": \"This post was created by an agent.\"}]}
          ]
        }
      }
    }
  }"
```

## Uploading images

```bash
# Step 1: Get a presigned upload URL
UPLOAD=$(curl -s -X POST https://api.internet.dev/api/data/generate-presigned-url \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_API_KEY" \
  -d '{"type": "image/png", "file": "screenshot.png", "size": 102400, "domain": "nextslate.internet.dev"}')

UPLOAD_URL=$(echo $UPLOAD | jq -r '.uploadURL')
FILE_URL=$(echo $UPLOAD | jq -r '.fileURL')

# Step 2: Upload the file
curl -X PUT "$UPLOAD_URL" --data-binary @screenshot.png

# Step 3: Use the URL in your editor content as an image node
# {"type": "image", "url": "FILE_URL", "children": [{"text": ""}]}
```

Max file size: 15 MB.

## Agent workflow

When given a prompt to create a post on nextslate.internet.dev:

1. Verify the API key works by calling `PUT /api/users/viewer`
2. Get the username from the viewer response
3. Create a new post via `POST /api/posts/create` with `type: "NEXT_SLATE"`
4. Generate a slug from the title
5. Build the `editorContent.children` array using the Slate node format above
6. Update the post via `POST /api/posts/update` with all fields
7. Return the public URL: `https://nextslate.internet.dev/{username}/{slug}`

### What the agent needs

When given an incomplete prompt, the agent should ask for:

1. **API key** (required) — the `X-API-KEY` value
2. **Title** (required) — the post title, used to generate the URL slug
3. **Content** (required) — what to write about, or instructions to generate content
4. **Description** (optional) — brief summary for post lists
5. **Visibility** (optional) — public or private, defaults to private

## Common agent mistakes

### Mistake 1: Using wrong node types

**Wrong** — node types that don't exist in the nextslate.internet.dev schema:
```json
{"type": "h1", "children": [{"text": "Title"}]},
{"type": "code_block", "children": [{"text": "x = 1"}]}
```

**Correct** — use the exact type names from the schema:
```json
{"type": "heading-one", "children": [{"text": "Title"}]},
{"type": "paragraph", "children": [{"text": "x = 1"}]}
```

### Mistake 2: Forgetting empty text child on media nodes

**Wrong** — image/video without children:
```json
{"type": "image", "url": "https://..."}
```

**Correct** — always include children with empty text (alt is optional but recommended):
```json
{"type": "image", "url": "https://...", "alt": "Description of image", "children": [{"text": ""}]}
```

### Mistake 3: Putting list items outside a list wrapper

**Wrong** — list items must be inside a list node:
```json
{"type": "list-item", "children": [{"text": "Item one"}]},
{"type": "list-item", "children": [{"text": "Item two"}]}
```

**Correct** — wrap in bulleted-list or numbered-list:
```json
{"type": "bulleted-list", "children": [
  {"type": "list-item", "children": [{"text": "Item one"}]},
  {"type": "list-item", "children": [{"text": "Item two"}]}
]}
```

### Mistake 4: Using markdown syntax instead of Slate marks

**Wrong** — markdown formatting in text content:
```json
{"type": "paragraph", "children": [{"text": "This is **bold** text"}]}
```

**Correct** — use Slate marks for formatting:
```json
{"type": "paragraph", "children": [
  {"text": "This is "},
  {"text": "bold", "bold": true},
  {"text": " text"}
]}
```

### Mistake 5: Nesting paragraphs inside paragraphs

**Wrong:**
```json
{"type": "paragraph", "children": [
  {"type": "paragraph", "children": [{"text": "Nested"}]}
]}
```

**Correct** — paragraphs are top-level only:
```json
{"type": "paragraph", "children": [{"text": "Not nested"}]}
```

### Mistake 6: Missing the url property on links

**Wrong:**
```json
{"type": "link", "children": [{"text": "Click here"}]}
```

**Correct:**
```json
{"type": "link", "url": "https://example.com", "children": [{"text": "Click here"}]}
```

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| 401 or empty viewer | Invalid or expired API key | Get a new key by signing in |
| Update returns null | Slug already exists for this user | Choose a different slug |
| Post not visible | `public` is `false` | Update with `"public": true` |
| File upload fails | File exceeds 15 MB | Reduce file size |
| Content renders blank | Malformed Slate nodes | Verify every node has `type`, `children`, and correct shape |
| Image not displaying | Missing `url` property or invalid URL | Upload via presigned URL first, use returned `fileURL` |
| List items not grouped | List items outside a list wrapper | Wrap in `bulleted-list` or `numbered-list` |

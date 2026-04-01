# Screen 13: Tags Management

## Phase: 1 (Free Community Edition)

## Description
Tags are managed inline from the Workflow editor top bar and from the Overview page. There is no dedicated tags page — tags are created and assigned contextually.

## ASCII Wireframe — Tag Selector (in Canvas top bar)

```
┌──────────────────────────────────────────────────┐
│ My Workflow ✏️  [email] [sync] [+ Add Tag]       │
│                                                  │
│ ┌─ Tag Dropdown ─────────────────────────────┐   │
│ │ 🔍 Search or create tag...                 │   │
│ ├────────────────────────────────────────────┤   │
│ │ ☑ email                                    │   │
│ │ ☑ sync                                     │   │
│ │ ☐ bot                                      │   │
│ │ ☐ report                                   │   │
│ │ ☐ api                                      │   │
│ ├────────────────────────────────────────────┤   │
│ │ + Create "new-tag"                         │   │
│ └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

## Tag Filter (in Overview page)

```
┌──────────────────────────────────────────────────┐
│ Filter by Tags                            [✕]    │
│ ┌────────────────────────────────────────────┐   │
│ │ ☑ email  (3 workflows)                     │   │
│ │ ☑ sync   (2 workflows)                     │   │
│ │ ☐ bot    (1 workflow)                      │   │
│ │ ☐ report (4 workflows)                     │   │
│ │ ☐ api    (2 workflows)                     │   │
│ └────────────────────────────────────────────┘   │
│ ┌──────────┐ ┌──────────┐                        │
│ │  Apply   │ │  Clear   │                        │
│ └──────────┘ └──────────┘                        │
└──────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's tag management exactly — inline in the editor top bar
- Same search-or-create dropdown behavior
- Same tag pills displayed on workflow list items
- Same tag filter in Overview page
- Tags API: GET/POST/PUT/DELETE /tags — all available in Community Edition

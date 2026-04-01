# Screen 14: Data Tables

## Phase: 1 (Free Community Edition)

## Description
Manage structured data tables within n8n. Create tables with typed columns, view/edit rows in a spreadsheet-like grid. Data Tables were introduced in n8n v1.113+.

## ASCII Wireframe — Table List

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Data Tables                                             │
│  n8n │                                                         │
│ ──── │  ┌─────────────────┐         ┌────────────────────┐     │
│      │  │ 🔍 Search...    │         │ + Create Table     │     │
│ Over │  └─────────────────┘         └────────────────────┘     │
│ view │                                                         │
│      │  ┌──────────────────────────────────────────────────┐   │
│ Data │  │  Name              Columns    Rows     Created   │   │
│ Table│  ├──────────────────────────────────────────────────┤   │
│ s    │  │  customers         4          1,234    Mar 1     │   │
│      │  │  orders            6          5,678    Mar 15    │   │
│      │  │  inventory         3          890      Apr 1     │   │
│      │  └──────────────────────────────────────────────────┘   │
└──────┴──────────────────────────────────────────────────────────┘
```

## Table Detail View (spreadsheet grid)

```
┌──────────────────────────────────────────────────────────┐
│ ◀ customers                    [+ Add Row] [🗑 Delete]   │
│                                                          │
│ ┌──────┬──────────────────┬──────────┬─────┬──────────┐  │
│ │  #   │ email            │ status   │ age │ active   │  │
│ ├──────┼──────────────────┼──────────┼─────┼──────────┤  │
│ │  1   │ john@example.com │ active   │ 30  │ true     │  │
│ │  2   │ jane@example.com │ pending  │ 25  │ true     │  │
│ │  3   │ bob@example.com  │ inactive │ 45  │ false    │  │
│ │  4   │ alice@example.com│ active   │ 28  │ true     │  │
│ │  5   │ ...              │ ...      │ ... │ ...      │  │
│ └──────┴──────────────────┴──────────┴─────┴──────────┘  │
│                                                          │
│ Showing 1-25 of 1,234 rows    ◀ 1 2 3 ... 50 ▶          │
└──────────────────────────────────────────────────────────┘
```

## Create Table Modal

```
┌──────────────────────────────────────────────────┐
│ Create Data Table                         [✕]    │
│                                                  │
│ Table Name                                       │
│ ┌──────────────────────────────────────────┐     │
│ │ customers                                │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ Columns                                          │
│ ┌──────────────┬──────────┬──────────────────┐   │
│ │ Name         │ Type   ▼ │              [🗑] │   │
│ ├──────────────┼──────────┼──────────────────┤   │
│ │ email        │ string   │              [🗑] │   │
│ │ status       │ string   │              [🗑] │   │
│ │ age          │ number   │              [🗑] │   │
│ │ active       │ boolean  │              [🗑] │   │
│ └──────────────┴──────────┴──────────────────┘   │
│ [+ Add Column]                                   │
│                                                  │
│ ┌──────────────────────────────────────────┐     │
│ │              Create                      │     │
│ └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Data Tables feature introduced in v1.113
- Same spreadsheet-like grid view for rows
- Same column type support: string, number, boolean
- Same CRUD operations via API
- Data Tables API is available on all self-hosted instances

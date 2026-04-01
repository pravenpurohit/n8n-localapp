# Mega Review Prompt — Run All Reviews

Copy this file into any repository and ask the agent: "Run the mega review from `review-for-export.md`."

---

## How This Works

This prompt runs 10 specialized review perspectives against your project, in sequence. Each review produces findings. Every finding from every review must pass a mandatory critic challenge before it can be accepted or acted upon. Findings that don't survive the critic are dropped and never carried forward.

This prevents the most common failure mode of AI-driven reviews: cascading overcaution, where one inflated finding contaminates every subsequent review.

---

## Execution Rules

1. Run each review in order (1 through 10).
2. After each review completes, run the Critic Challenge on that review's findings before moving to the next review.
3. Only findings that survive the critic are carried forward as context for subsequent reviews.
4. Dropped findings must not appear in context for later reviews or in the final summary.
5. Do not implement any findings during the review. Collect everything first, present the final summary, then wait for user direction.

---

## Critic Challenge Protocol (Mandatory After Every Review)

For every finding produced by a review, the critic must ask:

1. **Actionable?** Is the recommended fix concrete and specific, or is it vague hand-waving? ("Improve error handling" = drop it. "Add try/catch around the DB call in `userService.ts:47` returning a 503 with retry-after header" = keep it.)
2. **Proportionate?** Does the fix add more complexity than the problem it solves? If the cure is worse than the disease, drop it.
3. **Real?** If this finding is ignored entirely, would something actually go wrong — a bug, a crash, a security hole, data loss, a broken user experience? Or is this a style preference, a "best practice" that doesn't prevent a concrete problem? If nothing breaks, drop it.
4. **Severity accurate?** Are CRITICAL and HIGH ratings genuinely blocking issues, or are they inflated? Challenge every elevated severity. Downgrade or drop if inflated.

Drop findings that fail any of these checks. After the critic pass, note: "Critic challenge dropped N findings that were overcautious, vague, or not actionable."

Only surviving findings enter the context for the next review in the sequence.

---

## Review 1: Business & Problem Validation

You are a seasoned Product Strategist. Challenge whether the right problem is being solved, whether the scope is appropriate, and whether the solution approach makes business sense.

Read the project's requirements, design documents, README, and any available context. Evaluate:

### Problem Clarity
- Is the core problem clearly stated in one sentence?
- Is this a real problem that real users have, or an assumed problem?
- Is the problem worth custom software, or does an existing solution cover it?
- Is the problem statement too broad or too narrow?

### Scope Discipline
- Is the scope realistic for the team size?
- Are "nice to have" features masquerading as "must have"?
- Is there a clear MVP boundary?
- Flag features that don't trace back to the core problem.

### User & Value Alignment
- Who specifically benefits? Is the target user clearly defined?
- Does every major feature connect to a user need?
- Is there a clear value proposition over alternatives?

### Assumptions Check
- List the top 3-5 assumptions about users, market, or technology.
- For each: validated or untested? What happens if wrong?

### Simplification Opportunities
- Could the same core value be delivered with significantly less complexity?
- Are there features that could be deferred to v2?

**Output**: For each area — assessment (Good / Needs Attention / Red Flag), specific findings with examples, recommended action. End with a confidence statement on whether this project will deliver real value.

**Then run the Critic Challenge on all findings before proceeding to Review 2.**

---

## Review 2: User Journey & UX

You are an experienced UX Designer and Interaction Specialist. Walk through the product as a real user, not as a developer who knows the internals.

Read the project's code, UI components, routes/navigation, error handling, and documentation. Evaluate:

### Complete User Journeys
- Map the 2-3 primary user journeys: entry point → actions → completion → what happens next.
- Flag dead ends and orphaned states.

### First-Time User Experience
- What does a new user see? Is it clear what the product does and how to start?
- How many steps before first moment of value?

### Error & Edge Case Experience
- What happens when things go wrong? Are error messages for users or developers?
- Can users recover from errors without losing work?
- What happens at boundaries? (No data, too much data, long text, special characters)

### Navigation & Information Architecture
- Can the user always tell where they are? Can they get back?
- Is navigation intuitive from the user's perspective?

### Consistency & Polish
- Are similar actions handled the same way throughout?
- Are loading states, destructive action confirmations, and language consistent?

### Accessibility Basics
- Keyboard navigation, alt text, form labels, color contrast, target sizes.

### Nielsen's Heuristics Quick Check
Run the 10 usability heuristics as a rapid scan: system status visibility, real-world match, user control/freedom, consistency, error prevention, recognition over recall, flexibility, minimalist design, error recovery, help/documentation.

**Output**: For each area — assessment, specific findings describing the user's experience (not the code), recommended fix describing what the user should experience. End with the 3 most impactful UX improvements.

**Then run the Critic Challenge on all findings before proceeding to Review 3.**

---

## Review 3: Architecture & System Design

You are a Staff-level Software Architect. Evaluate whether the architecture is sound, appropriately complex, and will hold up as the project evolves.

Read the codebase, directory structure, configuration, and design documents. Evaluate:

### Component Boundaries & Separation of Concerns
- Clear boundaries between components? Business logic separated from infrastructure?
- God objects or over-abstraction?

### Dependency Graph & Coupling
- Map dependency relationships. Flag circular dependencies and tight coupling.
- Is there clear layering with dependencies flowing in one direction?

### Data Flow & State Management
- How does data flow? Is it traceable? Multiple sources of truth?
- Race conditions or stale data risks?

### Project Structure & Organization
- Does directory structure reflect architecture? Is it navigable?
- Flag over-nesting (3-4+ levels deep).

### Key Design Decisions
- Identify the 3-5 most significant architectural decisions.
- Were they made consciously? Is the rationale clear? Are any hard to reverse?

### Scaling Characteristics
- What happens at 10x and 100x data volume?
- Is the architecture maintainable by the current team size?

### Simplicity Check
- Could this be simpler? Are there abstractions that don't earn their complexity?
- Count distinct technologies/frameworks — is each justified?

**Output**: For each area — assessment (Sound / Needs Attention / Structural Risk), specific findings with file/component references, concrete recommendation. End with architecture verdict and the single most important structural change.

**Then run the Critic Challenge on all findings before proceeding to Review 4.**

---

## Review 4: Security & Data Integrity

You are an Application Security Engineer. Find security vulnerabilities, data integrity risks, and unsafe patterns — especially those commonly introduced by AI-generated code.

Read the codebase, configuration, environment handling, and dependencies. Evaluate:

### Input Validation & Injection
- SQL injection, XSS, command injection, path traversal. Are queries parameterized? Is user content escaped?

### Authentication & Authorization
- Password hashing (bcrypt/argon2, not MD5/SHA1). Secure session/token handling.
- Authorization checks beyond "is logged in" — can THIS user do THIS action?
- Endpoints that should require auth but don't.

### Secrets & Configuration
- Secrets in env vars, not code. `.env` in `.gitignore`. No secrets in git history.

### Data Integrity
- Transactions where atomicity matters. Validation at the data layer.
- Race conditions. Safe deletion handling.

### HTTPS & Transport Security
- HTTPS in production. External calls over HTTPS. CORS not `*` in production. Security headers.

### Dependency Vulnerabilities
- Known vulnerabilities in dependencies. Unmaintained packages. Phantom packages.

### Error Handling & Information Leakage
- Stack traces or internal details exposed to users? Sensitive data in logs?

### Common AI-Generated Code Pitfalls
- Hardcoded test credentials, disabled security with TODO comments, overly permissive CORS, HTTP instead of HTTPS, sensitive data in localStorage, missing rate limiting on auth endpoints.

**Output**: For each finding — severity (CRITICAL/HIGH/MEDIUM/LOW), what's wrong (file/line), what an attacker could do, how to fix it. End with security posture verdict and top 3 issues to fix before deployment.

**Then run the Critic Challenge on all findings before proceeding to Review 5.**

---

## Review 5: Code Quality & Maintainability

You are a Senior Developer performing a code quality review. Evaluate whether the codebase is clean, consistent, and maintainable — not just whether it works.

Read the codebase thoroughly. Evaluate:

### DRY Violations
- Duplicated logic, copy-paste patterns, duplicated configuration or constants.

### Project Structure & Organization
- Logical and navigable? Over-nesting? Related files co-located? Empty/unused boilerplate?

### Naming & Readability
- Descriptive and consistent names? Same concept called the same thing everywhere?

### Error Handling Patterns
- Consistent across the codebase? Empty catch clauses? Unhandled promise rejections?

### Complexity & Abstraction
- Functions over ~50 lines, files over ~300 lines. Abstractions that add indirection without value.

### Dead Code & Unused Artifacts
- Commented-out code, unused imports/variables/functions, TODO/FIXME/HACK comments.

### Consistency
- Code style consistent? Similar operations handled the same way? Linter/formatter configured?

### Documentation & Self-Documentation
- Complex decisions commented with "why"? README with setup/run/develop instructions? Magic numbers?

**Output**: For each area — assessment (Clean / Needs Cleanup / Technical Debt Risk), specific examples with file references, priority (Fix Now / Fix Soon / Fix Eventually). End with maintainability verdict and the single most impactful cleanup.

**Then run the Critic Challenge on all findings before proceeding to Review 6.**

---

## Review 6: Testing Strategy

You are a Test Architect. Evaluate whether the tests provide real confidence — not just whether tests exist and pass.

Read test files, source code, and test configuration. Evaluate:

### Coverage Assessment (Quality, Not Quantity)
- Is critical code tested? (Business logic, data transformations, auth, payment)
- Entire modules with zero tests?

### Test Quality
- Meaningful assertions or just "it doesn't throw"? Testing behavior or implementation details?
- Realistic data or trivial hardcoded values? Tautological tests?

### Edge Cases & Boundary Conditions
- Empty inputs, boundary values, invalid inputs, concurrent operations, network failures.

### Error Path Testing
- Error scenarios tested? External service failures? Validation errors? Auth failures?

### Test Architecture
- Clear separation of unit/integration/e2e? Tests run independently in any order?

### Test Data Strategy
- Realistic test data? No real secrets in tests?

### Property-Based Testing Opportunities
- Data transformations (round-trip), business calculations (invariants), sorting (idempotence), serialization.

### Missing Test Categories
- Smoke tests, regression tests, contract tests, snapshot tests.

**Output**: For each area — assessment (Strong / Adequate / Gaps / Weak), specific findings, priority (Critical Gap / Important Gap / Nice to Have). End with testing confidence level and the 3 highest-value tests to add.

**Then run the Critic Challenge on all findings before proceeding to Review 7.**

---

## Review 7: Performance & Scalability

You are a Performance Engineer. Identify bottlenecks, scalability limits, and resource efficiency issues that are invisible during development but surface under real load.

Read the codebase, database queries, API endpoints, and configuration. Evaluate:

### Database & Query Performance
- N+1 queries, over-fetching, missing indexes, unbounded result sets, connection pooling.

### Memory & Resource Usage
- Large datasets loaded into memory, memory leaks, synchronous operations blocking event loop.

### API & Network Efficiency
- Oversized responses, unnecessary data fetching, missing caching, no request batching/debouncing.

### Caching Opportunities
- Expensive operations producing same result for same input. Cache invalidation correctness.

### Concurrency & Async Patterns
- I/O operations async? Parallelizable operations running sequentially? Race conditions?

### Frontend Performance (if applicable)
- Bundle size, image optimization, lazy loading, unnecessary re-renders, code splitting.

### Scalability Characteristics
- First thing to break at 10x load? 100x? Stateless or stateful? Hard limits?

**Output**: For each finding — severity (Bottleneck / Inefficiency / Optimization), what's happening, impact under load, concrete fix. End with performance readiness verdict and top 3 performance wins.

**Then run the Critic Challenge on all findings before proceeding to Review 8.**

---

## Review 8: Operational Readiness

You are a Site Reliability Engineer. Evaluate whether this software can be deployed, monitored, debugged, and recovered when things go wrong in production.

Read the codebase, configuration, deployment files, and infrastructure code. Evaluate:

### Logging & Observability
- Structured logging with appropriate levels? Sufficient context for debugging? Sensitive values excluded?

### Error Reporting & Alerting
- Error reporting mechanism? Notification on error spikes? Errors categorized? Global error handler?

### Health Checks & Monitoring
- Health check endpoint verifying dependencies? Uptime monitoring? Key metrics tracked?

### Deployment & Release
- Documented deployment process? Zero-downtime deploy? Rollback strategy? Environment separation?

### Configuration Management
- Environment-specific values externalized? Safe defaults? Required env vars documented?

### Backup & Recovery
- Database backup strategy? Tested restore? Disaster recovery plan?

### Graceful Degradation
- Behavior when dependencies unavailable? Timeouts on external calls? Circuit breakers? Maintenance mode?

### Documentation for Operations
- Runbook? Common failure scenarios documented? Infrastructure documented?

**Output**: For each area — assessment (Ready / Partially Ready / Not Ready), specific findings, recommendation prioritized by impact. End with operational readiness verdict and minimum viable operations setup.

**Then run the Critic Challenge on all findings before proceeding to Review 9.**

---

## Review 9: API & Data Model Design

You are a Data Architect and API Designer. Evaluate whether data models are well-structured, APIs are consistent and evolvable, and contracts between components are solid.

Read database schemas, API routes, data models, and API documentation. Evaluate:

### Data Model Quality
- Clear entity boundaries? Appropriate normalization? Consistent field names and types? Dead fields?

### Schema Evolution & Migration
- Migration strategy? Migration files/tool? Backward-compatible changes?

### API Consistency
- Same URL conventions, HTTP methods, response format, status codes, error structure across all endpoints?

### API Completeness
- All needed CRUD operations? Pagination? Filtering/sorting? Bulk operations?

### Input Validation & Contracts
- Validation at API boundary? Request/response schemas documented or enforced? Single source of truth for contract?

### Data Integrity & Constraints
- Database constraints (NOT NULL, UNIQUE, FK)? Indexes? Orphaned records possible? Audit trail?

### API Security at the Contract Level
- Sensitive fields excluded from responses? Rate limiting? Bulk abuse protection? Input size limits?

### Naming & Convention Consistency
- Singular/plural consistent? Case convention consistent? Date format consistent? ID type consistent?

**Output**: For each area — assessment (Solid / Inconsistent / Needs Redesign), specific findings with schema/endpoint references, recommendation with migration path. End with data & API health verdict and most impactful improvement.

**Then run the Critic Challenge on all findings before proceeding to Review 10.**

---

## Review 10: Dependency & Supply Chain

You are a Supply Chain Security Specialist. Evaluate whether third-party packages are necessary, safe, maintained, and properly managed.

Read the package manifest, lock files, and import statements. Evaluate:

### Dependency Necessity
- Each dependency actually used? Could it be replaced by stdlib? Trivially simple packages? Duplicates?

### Dependency Existence & Authenticity
- All packages exist in the registry? Names spelled correctly? From expected authors?

### Maintenance & Health
- Last release date? Maintainer count? Open issue trajectory? Deprecated or superseded?

### Known Vulnerabilities
- Run or simulate dependency audit. Known CVEs? Transitive vulnerabilities?

### Version Management
- Versions pinned or loose ranges? Lock file committed? Version conflicts?

### License Compliance
- Licenses compatible with project's intended use? GPL in proprietary project? No-license packages?

### Dependency Update Strategy
- Update process in place? How far behind latest? Major updates pending?

### Build & Install Security
- Postinstall scripts? Registry configured correctly? Git URL dependencies?

**Output**: For each finding — risk level (Critical / High / Medium / Low), package name and version, what's wrong, recommended action. End with supply chain health verdict and immediate actions.

**Then run the Critic Challenge on all findings. This is the final review.**

---

## Final Output: Unified Summary

After all 10 reviews and their critic challenges are complete, produce a single summary containing only findings that survived the critic.

### Project Health Scorecard

| Perspective | Status | Top Issue |
|-------------|--------|-----------|
| Business & Problem | 🟢 / 🟡 / 🔴 | One-line summary |
| User Journey & UX | 🟢 / 🟡 / 🔴 | One-line summary |
| Architecture | 🟢 / 🟡 / 🔴 | One-line summary |
| Security | 🟢 / 🟡 / 🔴 | One-line summary |
| Code Quality | 🟢 / 🟡 / 🔴 | One-line summary |
| Testing | 🟢 / 🟡 / 🔴 | One-line summary |
| Performance | 🟢 / 🟡 / 🔴 | One-line summary |
| Operations | 🟢 / 🟡 / 🔴 | One-line summary |
| API & Data Model | 🟢 / 🟡 / 🔴 | One-line summary |
| Dependencies | 🟢 / 🟡 / 🔴 | One-line summary |

### Critic Challenge Summary

| Review | Findings Produced | Findings Dropped | Findings Surviving |
|--------|-------------------|------------------|--------------------|
| 1. Business | N | N | N |
| 2. UX | N | N | N |
| 3. Architecture | N | N | N |
| 4. Security | N | N | N |
| 5. Code Quality | N | N | N |
| 6. Testing | N | N | N |
| 7. Performance | N | N | N |
| 8. Operations | N | N | N |
| 9. API & Data | N | N | N |
| 10. Dependencies | N | N | N |
| **Total** | **N** | **N** | **N** |

### Top 5 Actions (Highest Impact)

Across all perspectives, the 5 most impactful things to address:

1. [Action] — from [perspective] — why it matters
2. [Action] — from [perspective] — why it matters
3. [Action] — from [perspective] — why it matters
4. [Action] — from [perspective] — why it matters
5. [Action] — from [perspective] — why it matters

### Overall Verdict

One paragraph: Is this project on track to be production-ready? What's the biggest risk? What's the strongest aspect?

---

## Quick Check Bundles

If you don't have time for the full review, use these subsets:

- **Pre-Deploy**: Security (#4) + Operational Readiness (#8) + Performance (#7) + Dependencies (#10)
- **Architecture Check**: Architecture (#3) + API & Data Model (#9) + Code Quality (#5)
- **User-Facing Check**: Business Validation (#1) + User Journey & UX (#2)
- **Quality Check**: Testing (#6) + Code Quality (#5) + Security (#4)

Each bundle still requires the Critic Challenge after every individual review.

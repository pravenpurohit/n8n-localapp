# Requirements Document

## Introduction

This document defines the requirements for a local-only n8n desktop/web application ("Local n8n App") that replicates the full functionality of the n8n.com web interface. The application runs entirely on the user's local machine, connects to a self-hosted n8n instance (e.g., via Docker) using the n8n REST API, and authenticates via API keys. The application provides a complete visual workflow automation experience including a node-based canvas editor, execution management, credential storage, template browsing, analytics, and all settings management — matching every screen and capability of the hosted n8n platform.

## Glossary

- **App**: The Local n8n App being specified in this document
- **n8n_Instance**: A self-hosted n8n server running locally (e.g., via Docker or npm)
- **API_Key**: An X-N8N-API-KEY header token used to authenticate all REST API calls to the n8n_Instance
- **Workflow**: A directed graph of connected nodes that defines an automation process
- **Node**: A single unit of work within a Workflow (e.g., HTTP Request, Slack, Code)
- **Trigger_Node**: A special Node that initiates Workflow execution based on events or schedules
- **Canvas**: The visual grid-based editor area where Nodes are placed and connected
- **Execution**: A single run of a Workflow, producing input/output data per Node
- **Credential**: An encrypted set of authentication details (API keys, OAuth tokens) used by Nodes
- **Expression**: A dynamic value using {{ }} syntax that references data from other Nodes or variables
- **Variable**: A key-value pair defined at the instance level, accessible via $vars syntax
- **Project**: An organizational unit grouping Workflows and Credentials with role-based access
- **Template**: A pre-made Workflow available for import and reuse
- **Tag**: A label applied to Workflows for categorization and filtering
- **Sticky_Note**: A text annotation placed on the Canvas for documentation purposes
- **Connection**: A visual line linking the output of one Node to the input of another Node
- **Cluster_Node**: An AI/LangChain-specific Node type (Agent, Vector Store, Embeddings, Memory, Tools)
- **Community_Node**: A third-party Node package installable from npm
- **Log_Stream**: A configured destination for streaming n8n event logs
- **Source_Control**: Git-based version control integration for Workflows
- **External_Secret**: A secret value stored in an external provider (e.g., AWS Secrets Manager)
- **Webhook**: An HTTP endpoint that triggers a Workflow when called
- **Data_Table**: A structured data store within n8n for persistent row-based data

## Phase Classification

Based on research into the n8n Community Edition (free self-hosted) vs Enterprise/Paid features, requirements are classified into two phases:

### Phase 1 — Free Community Edition Public API (Self-Hosted)
These features are fully supported by the free n8n self-hosted Community Edition public REST API (`/api/v1/*`), authenticated via the `X-N8N-API-KEY` header read from `.env`. No session login required.

| Req # | Requirement | API Endpoints Used |
|-------|------------|-------------------|
| 1 | API Key Authentication via .env | .env file → X-N8N-API-KEY header |
| 2 | Overview / Home Page | GET /workflows, GET /credentials, GET /executions |
| 3 | Workflow Canvas Editor | GET/PUT /workflows/{id} |
| 4 | Node Configuration Panel | GET /workflows/{id} (node definitions) |
| 5 | Global Executions Page | GET /executions, DELETE /executions/{id}, POST /executions/{id}/retry |
| 6 | Workflow-Level Executions | GET /executions?workflowId={id} |
| 7 | Credentials Management | GET/POST/PATCH/DELETE /credentials, GET /credentials/schema/{type} |
| 8 | Templates Page | n8n.io templates API (public, no auth needed) |
| 12 | Local App Settings (theme only) | Local storage (no API needed) |
| 14 | Connection Status (read-only) | GET /workflows?limit=1 (test connection) |
| 21 | Workflow Settings Modal | PUT /workflows/{id} (settings in workflow object) |
| 23 | Tags Management | GET/POST/PUT/DELETE /tags |
| 24 | Data Tables Management | GET/POST/PATCH/DELETE /data-tables, /data-tables/{id}/rows |
| 25 | Workflow Import/Export | POST /workflows (import), GET /workflows/{id} (export) |
| 26 | Security Audit | POST /audit |
| 29 | Left Sidebar Navigation | App UI (no API needed) |
| 30 | Responsive Layout & Theming | App UI (no API needed) |
| 31 | Webhook Management | Part of workflow node config |
| 32 | Code Node Support | Part of workflow node config |
| 33 | AI/LangChain Workflow Support | Part of workflow node config |
| 34 | Error Handling & Offline Behavior | App UI (no API needed) |
| 35 | Mock Screens & Wireframes | Documentation only |
| 36 | Workflow Activation/Deactivation | POST /workflows/{id}/activate, /deactivate |
| 37 | Workflow CRUD Operations | GET/POST/PUT/DELETE /workflows |

### Phase 2 — Enterprise/Paid Features
These features require an Enterprise or paid plan license. The n8n Community Edition explicitly excludes them (per docs.n8n.io/hosting/community-edition-features/). They can be implemented as UI stubs that show "Enterprise feature — requires license" or fully implemented for users who have a paid license.

| Req # | Requirement | Why Enterprise/Paid |
|-------|------------|-------------------|
| 9 | Variables Management | "Custom Variables" listed as excluded from Community Edition |
| 10 | Insights / Analytics Dashboard | Insights dashboard requires Pro/Business/Enterprise plan |
| 11 | Projects Management | "Projects" listed as excluded from Community Edition |
| 13 | Users Management | User management API is Enterprise feature |
| 15 | LDAP Settings | "SSO (SAML, LDAP)" listed as excluded from Community Edition |
| 16 | SAML/SSO Settings | "SSO (SAML, LDAP)" listed as excluded from Community Edition |
| 17 | Log Streaming Settings | "Log streaming" listed as excluded from Community Edition |
| 18 | External Secrets Settings | "External secrets" listed as excluded from Community Edition |
| 20 | Source Control (Git) Settings | "Version control using Git" listed as excluded from Community Edition |
| 22 | Workflow History/Versions | Workflow history requires paid plan |
| 27 | Sharing and Collaboration | "Sharing (workflows, credentials)" listed as excluded from Community Edition |
| 28 | AI Assistant Panel | AI Assistant is a paid Cloud/Enterprise feature |

### Phase 3 — Requires Internal REST API (Session Auth, not API Key)
These features are available on the free Community Edition but have no public API endpoint. They require authenticating via `POST /rest/login` (email/password) and using the internal REST API (`/rest/*`), which is undocumented and may change between n8n versions. Deferred because the public API key cannot access these.

| Req # | Requirement | Why Not API Key |
|-------|------------|----------------|
| 12 | Personal Settings (profile, password) | Profile update and password change use /rest/ endpoints only |
| 14 | API Keys Management | Creating/deleting API keys uses /rest/api-keys (not /api/v1/) |
| 19 | Community Nodes Settings | Install/uninstall community nodes uses /rest/ endpoints only |

---

## Requirements

### PHASE 1 — Community Edition (Free API)

### Requirement 1: API Key Authentication via .env

**User Story:** As a user, I want the App to read my n8n API key from a .env file, so that I can connect to my local n8n instance without a login screen.

#### Acceptance Criteria

1. WHEN the App starts, THE App SHALL read N8N_BASE_URL and N8N_API_KEY from the .env file in the project root.
2. THE App SHALL include the X-N8N-API-KEY header with the stored API_Key value on all requests to the n8n_Instance public REST API (/api/v1/*).
3. WHEN the .env file contains valid credentials, THE App SHALL navigate directly to the Overview screen (no login screen).
4. IF the .env file is missing or N8N_API_KEY is empty, THEN THE App SHALL display an error screen with instructions to configure the .env file.
5. IF an API request returns a 401 Unauthorized response, THEN THE App SHALL display an error notification instructing the user to check the .env file credentials.
6. THE App SHALL include a .env.example file in the repository with placeholder values and documentation comments.
7. THE .env file SHALL be listed in .gitignore to prevent credential leakage.

---

### Requirement 2: Overview / Home Page

**User Story:** As a user, I want a central overview page showing all my workflows, credentials, and executions, so that I can quickly navigate to any resource.

#### Acceptance Criteria

1. WHEN the user navigates to the Overview page, THE App SHALL display three tabs: Workflows, Credentials, and Executions.
2. WHEN the Workflows tab is active, THE App SHALL display a list of all Workflows retrieved from the n8n_Instance, showing name, status (active/inactive), tags, last updated date, and created date for each Workflow.
3. WHEN the Credentials tab is active, THE App SHALL display a list of all Credentials retrieved from the n8n_Instance, showing name and type for each Credential.
4. WHEN the Executions tab is active, THE App SHALL display a list of recent Executions retrieved from the n8n_Instance, showing workflow name, started-at timestamp, status, and execution ID for each Execution.
5. THE App SHALL provide a search input field on the Overview page that filters the currently active tab's list by name.
6. THE App SHALL provide a "Create Workflow" button on the Workflows tab that navigates to a new empty Workflow Canvas.
7. WHEN the user clicks a Workflow in the list, THE App SHALL navigate to the Workflow Canvas editor for that Workflow.
8. THE App SHALL provide tag-based filtering on the Workflows tab, allowing the user to select one or more Tags to narrow the displayed list.

---

### Requirement 3: Workflow Canvas Editor

**User Story:** As a user, I want a visual node-based canvas editor, so that I can build and edit automation workflows by placing and connecting nodes.

#### Acceptance Criteria

1. WHEN the user opens a Workflow, THE App SHALL render a Canvas with a gray dotted grid background displaying all Nodes and Connections belonging to that Workflow.
2. THE App SHALL display a top bar containing the editable Workflow name, Tags selector, Save button, Publish/Activate button, Share button (Phase 2 — disabled in Phase 1), and History button (Phase 2 — disabled in Phase 1).
3. THE App SHALL provide canvas controls for zoom-to-fit, zoom-in, zoom-out, reset-zoom, and tidy-up-nodes operations.
4. WHEN the user clicks the "+" add-node button on the Canvas, THE App SHALL open a searchable Node selection panel categorized by type (Advanced AI, Actions in an App, Data transformation, Flow, Core, Human in the loop).
5. WHEN the user drags a Node onto the Canvas, THE App SHALL place the Node at the drop position and allow the user to create Connections by dragging from a Node output to another Node input.
6. WHEN the user hovers over a Node on the Canvas, THE App SHALL display action icons for Execute (play), Deactivate/Activate (power), Delete (trash), and More options (ellipsis).
7. WHEN the user clicks a Node on the Canvas, THE App SHALL open the Node Configuration Panel on the right side of the screen.
8. THE App SHALL render Connection lines between connected Nodes, visually indicating data flow direction.
9. WHEN the user clicks the "Execute Workflow" button, THE App SHALL trigger a manual execution of the Workflow via the n8n_Instance API and display execution progress indicators on each Node.
10. WHEN a Workflow execution completes, THE App SHALL display green checkmark icons on successfully executed Nodes and red X icons on failed Nodes.
11. THE App SHALL provide a Sticky_Note button that allows the user to place text annotations on the Canvas.
12. WHEN a new empty Workflow is opened, THE App SHALL display an "Add first step" placeholder prompting the user to add a Trigger_Node.

---

### Requirement 4: Node Configuration Panel

**User Story:** As a user, I want to configure each node's parameters, credentials, and settings, so that I can define the behavior of each step in my workflow.

#### Acceptance Criteria

1. WHEN the user selects a Node on the Canvas, THE App SHALL display a configuration panel with tabs for Parameters, Settings, Input, and Output.
2. WHEN the Parameters tab is active, THE App SHALL render node-specific input fields (e.g., URL, HTTP method, request body, message text) based on the Node type definition.
3. WHEN a Node requires authentication, THE App SHALL display a Credentials section within the Parameters tab allowing the user to select an existing Credential or create a new one.
4. WHEN the Settings tab is active, THE App SHALL display node-level settings including "Retry on Fail", "Continue on Fail", "Always Output Data", and "Execute Once" toggles.
5. WHEN the Input tab is active, THE App SHALL display the JSON data received by the Node from its upstream Connection during the most recent Execution.
6. WHEN the Output tab is active, THE App SHALL display the JSON data produced by the Node during the most recent Execution.
7. WHEN the user enters an Expression using {{ }} syntax in a parameter field, THE App SHALL provide an expression editor with autocomplete for available data references from upstream Nodes and Variables.
8. THE App SHALL validate Node parameter inputs and display inline validation errors for missing required fields or invalid values.

---

### Requirement 5: Global Executions Page

**User Story:** As a user, I want to view and manage all workflow executions in one place, so that I can monitor, debug, and retry failed runs.

#### Acceptance Criteria

1. WHEN the user navigates to the Executions page, THE App SHALL display a table of all Executions retrieved from the n8n_Instance API, showing workflow name, started-at timestamp, status, and execution ID.
2. THE App SHALL provide status filter options: Any Status, Failed, Cancelled, Running, Success, and Waiting.
3. THE App SHALL provide a workflow name filter dropdown to show Executions for a specific Workflow.
4. THE App SHALL provide a time range filter to limit Executions to a selected date range.
5. WHEN the user clicks an Execution row, THE App SHALL display the execution detail view showing node-by-node execution data with input and output JSON for each Node.
6. WHEN the user views a failed Execution, THE App SHALL display a "Retry" button that re-triggers the Execution via the n8n_Instance API.
7. WHEN the user selects one or more Executions, THE App SHALL provide a "Delete" action to remove the selected Executions via the n8n_Instance API.
8. THE App SHALL support bulk operations for stopping and deleting multiple Executions simultaneously.

---

### Requirement 6: Workflow-Level Executions

**User Story:** As a user, I want to view past executions of a specific workflow from within the editor, so that I can debug and re-run previous versions.

#### Acceptance Criteria

1. WHEN the user opens the Executions tab within a Workflow editor, THE App SHALL display a list of previous Executions for that specific Workflow.
2. WHEN the user selects a past Execution from the workflow-level list, THE App SHALL display the execution data overlaid on the Canvas, showing input/output data per Node.
3. THE App SHALL provide a "Copy to Editor" action that loads a past Execution's Workflow state into the Canvas for editing and debugging.
4. THE App SHALL provide a "Re-run" action that re-executes a past Execution with the same input data via the n8n_Instance API.

---

### Requirement 7: Credentials Management

**User Story:** As a user, I want to create, edit, test, and manage credentials for third-party services, so that my workflow nodes can authenticate with external APIs.

#### Acceptance Criteria

1. WHEN the user navigates to the Credentials page, THE App SHALL display a list of all Credentials retrieved from the n8n_Instance API, showing name and type for each Credential.
2. THE App SHALL provide a "Create New Credential" button that opens a credential creation form.
3. WHEN creating a new Credential, THE App SHALL display a searchable dropdown of all available credential types (e.g., githubApi, slackApi, notionApi, httpBasicAuth).
4. WHEN a credential type is selected, THE App SHALL render the type-specific input fields (API keys, tokens, OAuth configuration, client ID/secret) based on the credential schema retrieved from the n8n_Instance API.
5. THE App SHALL provide a "Test Connection" button that validates the Credential against the target service via the n8n_Instance API and displays the result (success or failure with error details).
6. WHEN the user edits an existing Credential, THE App SHALL load the current field values (with secrets masked) and allow modification.
7. WHEN the user deletes a Credential, THE App SHALL confirm the deletion and remove the Credential via the n8n_Instance API.
8. THE App SHALL provide a "Transfer" action to move a Credential from one Project to another via the n8n_Instance API (Phase 2 — requires Projects).

---

### Requirement 8: Templates Page

**User Story:** As a user, I want to browse and import pre-made workflow templates, so that I can quickly set up common automations without building from scratch.

#### Acceptance Criteria

1. WHEN the user navigates to the Templates page, THE App SHALL display a browsable gallery of pre-made Workflow templates.
2. THE App SHALL provide a search input field that filters templates by name and description.
3. THE App SHALL provide category and use-case filter options to narrow the displayed templates.
4. WHEN the user clicks a template, THE App SHALL display a detail view showing the template description, included Nodes, and a visual preview of the Workflow.
5. WHEN the user clicks "Use This Template", THE App SHALL import the template as a new Workflow in the Canvas editor, pre-populated with the template's Nodes and Connections.

---

### PHASE 2 — Enterprise/Paid Features

### Requirement 9: Variables Management (Enterprise)

**User Story:** As a user, I want to define instance-level variables as key-value pairs, so that I can reference shared configuration values across multiple workflows using $vars syntax.

#### Acceptance Criteria

1. WHEN the user navigates to the Variables page, THE App SHALL display a list of all Variables retrieved from the n8n_Instance API, showing key and value for each Variable.
2. THE App SHALL provide a "Create Variable" button that opens a form with key and value input fields.
3. WHEN the user submits a new Variable, THE App SHALL create the Variable via the n8n_Instance API and add the Variable to the displayed list.
4. WHEN the user edits an existing Variable, THE App SHALL update the Variable via the n8n_Instance API.
5. WHEN the user deletes a Variable, THE App SHALL confirm the deletion and remove the Variable via the n8n_Instance API.
6. THE App SHALL display a reference hint indicating that Variables are accessible in Workflows via the $vars.key_name syntax.

---

### Requirement 10: Insights / Analytics Dashboard (Enterprise)

**User Story:** As a user, I want to view execution analytics and performance metrics, so that I can understand workflow health, failure rates, and time savings.

#### Acceptance Criteria

1. WHEN the user navigates to the Insights page, THE App SHALL display a summary banner showing total executions, failed executions, failure rate percentage, estimated time saved, and average run time for the selected time period.
2. THE App SHALL provide a time period selector with options: 24 hours, 7 days, 14 days, 30 days, 90 days, 6 months, and 1 year.
3. WHEN the user selects a time period, THE App SHALL update all displayed metrics and charts to reflect the selected range.
4. THE App SHALL display historical comparison charts showing execution trends over the selected time period.
5. THE App SHALL display a per-workflow metrics table showing execution count, failure count, failure rate, and average run time for each Workflow.
6. WHEN the user clicks a metric in the summary banner, THE App SHALL navigate to a detailed chart view for that specific metric.

---

### Requirement 11: Projects Management (Enterprise)

**User Story:** As a user, I want to organize workflows and credentials into projects with role-based access, so that I can manage resources in logical groups.

#### Acceptance Criteria

1. WHEN the user navigates to the Projects page, THE App SHALL display a list of all Projects retrieved from the n8n_Instance API.
2. THE App SHALL provide a "Create Project" button that opens a form with project name and member configuration fields.
3. WHEN the user opens a Project, THE App SHALL display the Workflows and Credentials assigned to that Project.
4. THE App SHALL allow the user to assign roles (project:admin, project:editor, project:viewer) to Project members.
5. WHEN the user edits a Project, THE App SHALL allow modification of the project name and member list via the n8n_Instance API.
6. WHEN the user deletes a Project, THE App SHALL confirm the deletion and remove the Project via the n8n_Instance API.
7. THE App SHALL allow transferring Workflows and Credentials between Projects via the n8n_Instance API.

---

### Requirement 12: Local App Settings (Theme & Preferences)

**Phase: 1** (local storage only, no API needed) / **Phase 3** (profile editing via internal REST API)

**User Story:** As a user, I want to manage my theme preferences and local app settings, so that I can customize the App to my preferences.

#### Acceptance Criteria

1. THE App SHALL provide a theme selector allowing the user to choose between light, dark, and system-default themes.
2. WHEN the user changes the theme, THE App SHALL apply the selected theme immediately across all screens.
3. THE App SHALL persist theme and preference settings in local storage (not via the n8n API).
4. THE App SHALL display the connected n8n_Instance URL (from .env) as read-only information.

---

### Requirement 13: Users Management (Enterprise)

**User Story:** As an admin user, I want to manage user accounts and roles, so that I can control who has access to the n8n instance.

#### Acceptance Criteria

1. WHEN the user navigates to Settings > Users, THE App SHALL display a list of all users retrieved from the n8n_Instance API, showing name, email, and role for each user.
2. THE App SHALL provide an "Invite User" button that opens a form to invite a new user by email with a selected role.
3. THE App SHALL support role assignment from the available roles: global:owner, global:admin, and global:member.
4. WHEN the user edits another user's account, THE App SHALL allow changing the user's role via the n8n_Instance API.
5. WHEN the user deletes a user account, THE App SHALL confirm the deletion and remove the user via the n8n_Instance API.
6. THE App SHALL provide a toggle to allow or disallow manual login for the n8n_Instance.

---

### Requirement 14: Connection Status Display

**Phase: 1** (read-only status) / **Phase 3** (full API key management via internal REST API)

**User Story:** As a user, I want to see my current connection status, so that I can verify the App is connected properly.

#### Acceptance Criteria

1. WHEN the user navigates to Settings > Connection, THE App SHALL display the current N8N_BASE_URL from the .env file (read-only).
2. THE App SHALL display the connection status (connected/disconnected) based on the last API response.
3. THE App SHALL display a "Test Connection" button that validates the current API key against the n8n_Instance by calling GET /api/v1/workflows?limit=1.
4. THE App SHALL display instructions for updating credentials by editing the .env file.

> Note: Full API key management (create/delete keys) is deferred to Phase 3 as it requires the internal /rest/ API with session authentication.

---

### Requirement 15: LDAP Settings (Enterprise)

**User Story:** As an admin user, I want to configure LDAP authentication, so that users can log in using their organization's directory service.

#### Acceptance Criteria

1. WHEN the user navigates to Settings > LDAP, THE App SHALL display the current LDAP configuration status (enabled/disabled).
2. THE App SHALL provide input fields for LDAP server URL, bind DN, bind password, base DN, and search filter.
3. THE App SHALL provide a "Test Connection" button that validates the LDAP configuration against the directory server via the n8n_Instance API.
4. WHEN the user enables LDAP, THE App SHALL save the configuration and activate LDAP login via the n8n_Instance API.
5. THE App SHALL provide sync settings to configure automatic user synchronization from the LDAP directory.

---

### Requirement 16: SAML/SSO Settings (Enterprise)

**User Story:** As an admin user, I want to configure SAML-based Single Sign-On, so that users can authenticate using the organization's identity provider.

#### Acceptance Criteria

1. WHEN the user navigates to Settings > SAML/SSO, THE App SHALL display the current SSO configuration status (enabled/disabled).
2. THE App SHALL display the Redirect URL and Entity ID values required for configuring the identity provider.
3. THE App SHALL provide input fields for the Identity Provider (IdP) metadata URL or XML configuration.
4. WHEN the user enables SSO, THE App SHALL save the configuration and activate SAML login via the n8n_Instance API.

---

### Requirement 17: Log Streaming Settings (Enterprise)

**User Story:** As an admin user, I want to configure log streaming destinations, so that n8n events are forwarded to external monitoring systems.

#### Acceptance Criteria

1. WHEN the user navigates to Settings > Log Streaming, THE App SHALL display a list of configured log streaming destinations.
2. THE App SHALL provide an "Add Destination" button that opens a form to configure a new Log_Stream destination.
3. WHEN configuring a destination, THE App SHALL provide destination-type-specific input fields (e.g., URL, authentication, format).
4. THE App SHALL provide event selection checkboxes allowing the user to choose which event types are streamed to each destination.
5. WHEN the user saves a Log_Stream configuration, THE App SHALL persist the configuration via the n8n_Instance API.

---

### Requirement 18: External Secrets Settings (Enterprise)

**User Story:** As an admin user, I want to configure external secret providers, so that workflows can access secrets stored in services like AWS Secrets Manager.

#### Acceptance Criteria

1. WHEN the user navigates to Settings > External Secrets, THE App SHALL display a list of configured External_Secret providers.
2. THE App SHALL provide a form to configure a new external secret provider with fields for provider type, access key, secret key, and region.
3. WHEN the user saves an External_Secret provider configuration, THE App SHALL persist the configuration via the n8n_Instance API.
4. THE App SHALL provide a "Test Connection" button that validates the external secret provider configuration via the n8n_Instance API.

---

### Requirement 19: Community Nodes Settings (Phase 3 — Internal REST API)

**User Story:** As a user, I want to install and manage community-contributed nodes from npm, so that I can extend n8n's capabilities with third-party integrations.

> Note: This feature requires the internal /rest/ API with session authentication (email/password login). It is not accessible via the public API key. Deferred to Phase 3.

#### Acceptance Criteria

1. WHEN the user navigates to Settings > Community Nodes, THE App SHALL display a list of installed Community_Node packages with name and version.
2. THE App SHALL provide an "Install" button that opens a form accepting an npm package name for installation.
3. WHEN the user submits a Community_Node package name, THE App SHALL install the package on the n8n_Instance and add the package to the installed list.
4. WHEN the user clicks "Uninstall" on a Community_Node, THE App SHALL confirm the action and remove the package from the n8n_Instance.
5. THE App SHALL indicate whether each installed Community_Node is verified or unverified.

---

### Requirement 20: Source Control (Git) Settings (Enterprise)

**User Story:** As a user, I want to connect my n8n instance to a Git repository, so that I can version-control my workflows and collaborate with team members.

#### Acceptance Criteria

1. WHEN the user navigates to Settings > Source Control, THE App SHALL display the current Git repository connection status.
2. THE App SHALL provide input fields for Git repository URL, branch name, and authentication credentials.
3. WHEN the user connects a Git repository, THE App SHALL save the Source_Control configuration via the n8n_Instance API.
4. THE App SHALL provide "Pull" and "Push" buttons that synchronize Workflows between the n8n_Instance and the connected Git repository via the n8n_Instance API.
5. THE App SHALL provide branch management controls allowing the user to select or switch the active branch.

---

### Requirement 21: Workflow Settings Modal

**User Story:** As a user, I want to configure workflow-level settings such as execution order, error handling, and timeouts, so that I can control how each workflow behaves during execution.

#### Acceptance Criteria

1. WHEN the user opens the Workflow Settings modal from the Canvas editor, THE App SHALL display all configurable Workflow settings.
2. THE App SHALL provide an execution order selector with options for v1 (recommended) and v0 (legacy).
3. THE App SHALL provide an error workflow selector dropdown listing all available Workflows that can handle errors.
4. THE App SHALL provide a "This workflow can be called by" permission selector to control sub-workflow access.
5. THE App SHALL provide a timezone selector for the Workflow's execution schedule context.
6. THE App SHALL provide toggles for "Save failed executions", "Save successful executions", and "Save manual executions".
7. THE App SHALL provide a "Save execution progress" toggle that enables intermediate execution state persistence.
8. THE App SHALL provide timeout configuration fields specifying maximum execution duration in seconds.
9. THE App SHALL provide an "Estimated time saved" configuration with Fixed and Dynamic calculation options.
10. WHEN the user saves Workflow settings, THE App SHALL persist the settings via the n8n_Instance API.

---

### Requirement 22: Workflow History and Versions (Enterprise)

**User Story:** As a user, I want to view and restore previous versions of a workflow, so that I can recover from unintended changes and track workflow evolution.

#### Acceptance Criteria

1. WHEN the user clicks the History button in the Workflow editor top bar, THE App SHALL display a list of previous Workflow versions with timestamps and change descriptions.
2. WHEN the user selects a previous version, THE App SHALL display a read-only preview of that version's Workflow on the Canvas.
3. THE App SHALL provide a "Restore" button that reverts the current Workflow to the selected previous version via the n8n_Instance API.
4. THE App SHALL provide a visual comparison view highlighting differences between the current version and a selected previous version.

---

### Requirement 23: Tags Management

**User Story:** As a user, I want to create and manage tags, so that I can categorize and filter workflows effectively.

#### Acceptance Criteria

1. THE App SHALL allow the user to create new Tags via the n8n_Instance API from the Workflow editor top bar or the Tags management interface.
2. THE App SHALL allow the user to assign one or more Tags to a Workflow.
3. THE App SHALL allow the user to rename and delete existing Tags via the n8n_Instance API.
4. WHEN a Tag is deleted, THE App SHALL remove the Tag association from all Workflows that used the deleted Tag.
5. THE App SHALL display assigned Tags as visual labels on Workflow list items in the Overview page.

---

### Requirement 24: Data Tables Management

**User Story:** As a user, I want to create and manage structured data tables within n8n, so that workflows can store and retrieve persistent row-based data.

#### Acceptance Criteria

1. WHEN the user navigates to the Data Tables section, THE App SHALL display a list of all Data_Table resources retrieved from the n8n_Instance API.
2. THE App SHALL provide a "Create Data Table" button that opens a form for defining table name and column schema.
3. WHEN the user opens a Data_Table, THE App SHALL display the table rows in a spreadsheet-like grid view with column headers.
4. THE App SHALL allow the user to add, edit, and delete rows within a Data_Table via the n8n_Instance API.
5. THE App SHALL support upsert operations on Data_Table rows via the n8n_Instance API.
6. WHEN the user deletes a Data_Table, THE App SHALL confirm the deletion and remove the table and all rows via the n8n_Instance API.

---

### Requirement 25: Workflow Import and Export

**User Story:** As a user, I want to import and export workflows as JSON files, so that I can back up, share, and migrate workflows between n8n instances.

#### Acceptance Criteria

1. THE App SHALL provide an "Export" action on each Workflow that downloads the Workflow definition as a JSON file.
2. THE App SHALL provide an "Import Workflow" action that accepts a JSON file and creates a new Workflow from the file contents via the n8n_Instance API.
3. WHEN the user imports a Workflow JSON file, THE App SHALL validate the JSON structure before submitting the import request.
4. IF the imported JSON file contains invalid Workflow structure, THEN THE App SHALL display a descriptive error message identifying the validation failure.
5. FOR ALL valid Workflow objects, exporting to JSON then importing from that JSON SHALL produce a functionally equivalent Workflow (round-trip property).

---

### Requirement 26: Security Audit

**User Story:** As an admin user, I want to run a security audit on my n8n instance, so that I can identify potential security vulnerabilities and misconfigurations.

#### Acceptance Criteria

1. THE App SHALL provide a "Run Security Audit" action accessible from the Settings area.
2. WHEN the user triggers a security audit, THE App SHALL call the POST /api/v1/audit endpoint on the n8n_Instance API.
3. WHEN the audit completes, THE App SHALL display the audit results organized by risk category with descriptions and remediation recommendations.

---

### Requirement 27: Sharing and Collaboration (Enterprise)

**User Story:** As a user, I want to share workflows with other users and assign role-based permissions, so that teams can collaborate on workflow development.

#### Acceptance Criteria

1. WHEN the user clicks the Share button in the Workflow editor, THE App SHALL display a sharing dialog listing current collaborators and their roles.
2. THE App SHALL allow the user to add collaborators by selecting users and assigning a permission role (editor, viewer).
3. WHEN the user modifies sharing permissions, THE App SHALL update the Workflow access configuration via the n8n_Instance API.
4. THE App SHALL display a visual indicator on shared Workflows in the Overview list to distinguish them from private Workflows.

---

### Requirement 28: AI Assistant Panel (Enterprise)

**User Story:** As a user, I want access to an AI assistant within the workflow editor, so that I can get help building workflows and troubleshooting issues.

#### Acceptance Criteria

1. WHEN the user clicks the "Ask Assistant" button on the Canvas, THE App SHALL open a right-side panel displaying the AI Assistant chat interface.
2. THE App SHALL allow the user to type questions about workflow building, node configuration, and troubleshooting in the AI Assistant panel.
3. WHEN the user submits a question, THE App SHALL send the query to the n8n_Instance AI assistant endpoint and display the response in the chat panel.
4. THE App SHALL maintain conversation history within the AI Assistant panel for the duration of the current session.

---

### Requirement 29: Left Sidebar Navigation

**User Story:** As a user, I want a persistent sidebar navigation, so that I can quickly access all major sections of the application.

#### Acceptance Criteria

1. THE App SHALL display a left sidebar navigation on all screens containing links to: Overview, Workflows, Credentials, Templates, Data Tables, Executions, and Settings. Phase 2 items (Variables, Insights, Projects) SHALL be shown with a locked/disabled indicator.
2. WHEN the user clicks a sidebar navigation item, THE App SHALL navigate to the corresponding page.
3. THE App SHALL visually highlight the currently active navigation item in the sidebar.
4. THE App SHALL display the connected n8n_Instance URL or name at the top of the sidebar.
5. THE App SHALL provide a collapsible sidebar mode that shows only icons to maximize Canvas workspace area.

---

### Requirement 30: Responsive Layout and Theming

**User Story:** As a user, I want the application to be visually consistent with n8n's design language and responsive to different window sizes, so that the experience feels familiar and usable.

#### Acceptance Criteria

1. THE App SHALL use a visual design language consistent with the n8n web interface, including color palette, typography, iconography, and component styling.
2. THE App SHALL support light and dark themes, switchable from Personal Settings.
3. THE App SHALL render all screens responsively, adapting layout to window sizes from 1024px width and above.
4. THE App SHALL maintain usable Canvas interactions (zoom, pan, drag, node selection) at all supported window sizes.

---

### Requirement 31: Webhook Management

**User Story:** As a user, I want to view and manage webhook URLs associated with my workflows, so that I can configure external services to trigger my automations.

#### Acceptance Criteria

1. WHEN a Workflow contains a Webhook Trigger_Node, THE App SHALL display the generated Webhook URL in the Node Configuration Panel.
2. THE App SHALL provide a copy-to-clipboard action for Webhook URLs.
3. WHEN a Workflow with a Webhook Trigger_Node is activated, THE App SHALL display the production Webhook URL.
4. WHEN a Workflow with a Webhook Trigger_Node is in test mode, THE App SHALL display the test Webhook URL.

---

### Requirement 32: Code Node Support

**User Story:** As a user, I want to write custom JavaScript and Python code within workflow nodes, so that I can implement custom logic not covered by built-in nodes.

#### Acceptance Criteria

1. WHEN the user adds a Code Node to the Canvas, THE App SHALL display a code editor within the Node Configuration Panel.
2. THE App SHALL support JavaScript and Python language modes in the Code Node editor, selectable via a language toggle.
3. THE App SHALL provide syntax highlighting, line numbers, and basic code completion in the Code Node editor.
4. WHEN the user executes a Workflow containing a Code Node, THE App SHALL display the code execution output in the Node's Output tab.
5. IF a Code Node execution produces a runtime error, THEN THE App SHALL display the error message and stack trace in the Node's Output tab.

---

### Requirement 33: AI and LangChain Workflow Support

**User Story:** As a user, I want to build AI-powered workflows using LangChain nodes, so that I can create intelligent automations with AI agents, vector stores, and embeddings.

#### Acceptance Criteria

1. THE App SHALL support Cluster_Node types in the Canvas including AI Agent, Vector Store, Embeddings, Memory, and Tools nodes.
2. WHEN the user adds a Cluster_Node to the Canvas, THE App SHALL render the node with its specialized connection ports (main, ai_agent, ai_memory, ai_tool, ai_vectorStore, ai_embedding).
3. THE App SHALL allow Connections between Cluster_Nodes following the n8n AI node connection rules (e.g., Memory connects to Agent's memory port).
4. WHEN the user configures an AI Agent Cluster_Node, THE App SHALL display configuration fields for the agent type, model selection, system prompt, and tool bindings.

---

### Requirement 34: Error Handling and Offline Behavior

**User Story:** As a user, I want the application to handle errors gracefully and inform me when the n8n instance is unreachable, so that I can troubleshoot connectivity issues.

#### Acceptance Criteria

1. IF the n8n_Instance becomes unreachable during App operation, THEN THE App SHALL display a non-blocking notification indicating the connection loss and retry the connection at 10-second intervals.
2. IF an API request to the n8n_Instance fails with a network error, THEN THE App SHALL display a descriptive error notification with the failure reason and a "Retry" action.
3. IF an API request to the n8n_Instance returns a server error (5xx status), THEN THE App SHALL display the error status code and response message to the user.
4. WHILE the n8n_Instance is unreachable, THE App SHALL allow the user to view previously cached data (workflow list, recent executions) in a read-only mode.
5. WHEN the connection to the n8n_Instance is restored, THE App SHALL automatically refresh the current view with live data and dismiss the connection loss notification.
6. IF an API request returns a 401 Unauthorized response, THEN THE App SHALL display an error notification instructing the user to check the .env file credentials.

---

### Requirement 35: Mock Screens and Wireframe Documentation

**User Story:** As a developer, I want detailed mock screen specifications and wireframe documentation for every application screen, so that the UI can be implemented accurately and compared against the actual n8n interface.

#### Acceptance Criteria

1. THE App SHALL include wireframe documentation for each of the following screens: .env Error Screen, Overview/Home, Workflow Canvas Editor, Node Configuration Panel (including Webhook, Code Node, and AI/LangChain sub-views), Global Executions, Workflow-Level Executions, Credentials, Templates, App Settings (theme + connection status), Workflow Settings Modal, Tags Management, Data Tables, Workflow Import/Export, Security Audit, Left Sidebar Navigation, and Error/Offline States. Phase 2 screens (Variables, Insights, Projects, Users, LDAP, SAML/SSO, Log Streaming, External Secrets, Source Control, Workflow History, Sharing, AI Assistant) and Phase 3 screens (Personal Settings profile editing, API Keys Management, Community Nodes) SHALL also be documented.
2. EACH wireframe document SHALL describe the screen layout, component placement, interactive elements, navigation flows, and data displayed.
3. EACH wireframe document SHALL include a comparison section noting alignment with and deviations from the corresponding n8n.com web interface screen.
4. THE wireframe documentation SHALL be authored in Markdown format with ASCII layout diagrams or descriptive component hierarchies.

---

### Requirement 36: Workflow Activation and Deactivation

**User Story:** As a user, I want to activate and deactivate workflows, so that I can control which automations are running on my n8n instance.

#### Acceptance Criteria

1. WHEN the user clicks the Publish/Activate button in the Workflow editor, THE App SHALL activate the Workflow via the n8n_Instance API and update the Workflow status to active.
2. WHEN the user deactivates an active Workflow, THE App SHALL deactivate the Workflow via the n8n_Instance API and update the Workflow status to inactive.
3. THE App SHALL display the current activation status (active/inactive) as a visual toggle in both the Workflow editor top bar and the Overview Workflow list.
4. WHEN a Workflow is activated, THE App SHALL display a confirmation indicating that the Workflow's Trigger_Nodes are now listening for events.

---

### Requirement 37: Workflow CRUD Operations

**User Story:** As a user, I want to create, read, update, and delete workflows, so that I can manage my automation library.

#### Acceptance Criteria

1. WHEN the user clicks "Create Workflow", THE App SHALL create a new empty Workflow via the n8n_Instance API and open the Workflow in the Canvas editor.
2. WHEN the user modifies a Workflow on the Canvas and clicks Save, THE App SHALL persist the Workflow changes via the n8n_Instance API.
3. WHEN the user deletes a Workflow, THE App SHALL confirm the deletion and remove the Workflow via the n8n_Instance API.
4. THE App SHALL prevent unsaved changes from being lost by displaying a confirmation dialog when the user navigates away from a modified Workflow without saving.
5. FOR ALL valid Workflow definitions, creating a Workflow then retrieving the Workflow SHALL return a Workflow with equivalent node and connection structure (round-trip property).

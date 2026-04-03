/**
 * Notification store for user-facing messages.
 * Surfaces execution errors, API failures, and billing issues as readable toasts.
 */

export interface Notification {
	id: string;
	severity: 'error' | 'warning' | 'info' | 'success';
	title: string;
	message: string;
	timestamp: number;
}

const KNOWN_ERRORS: Array<{ pattern: RegExp; title: string; message: string }> = [
	{
		pattern: /quota|exceeded.*quota|rate.?limit/i,
		title: 'API Quota Exceeded',
		message: 'Your API provider quota has been exceeded. Check your billing and usage limits.',
	},
	{
		pattern: /credit.?balance.*too low|insufficient.*credits?/i,
		title: 'Insufficient Credits',
		message: 'Your API provider account needs credits. Visit the provider dashboard to add funds.',
	},
	{
		pattern: /MODEL_NOT_FOUND|model.*not.*found|404.*no body/i,
		title: 'Model Not Available',
		message: 'The selected AI model is not available. It may be deprecated or your account may not have access.',
	},
	{
		pattern: /Unauthorized|invalid.*api.?key|authentication/i,
		title: 'Authentication Failed',
		message: 'The API key is invalid or expired. Update the credential in n8n.',
	},
	{
		pattern: /Unrecognized node type/i,
		title: 'Unsupported Node Type',
		message: 'This workflow uses a node type not available in your n8n version. Update n8n or remove the unsupported node.',
	},
	{
		pattern: /ECONNREFUSED|ENOTFOUND|network|timeout/i,
		title: 'Connection Failed',
		message: 'Could not reach the API provider. Check your internet connection and try again.',
	},
];

class NotificationStore {
	notifications = $state<Notification[]>([]);

	/** Add a notification, auto-classifying known error patterns */
	add(severity: Notification['severity'], title: string, message: string): void {
		const id = crypto.randomUUID();
		this.notifications = [...this.notifications, { id, severity, title, message, timestamp: Date.now() }];

		// Auto-dismiss non-errors after 8 seconds
		if (severity !== 'error') {
			setTimeout(() => this.dismiss(id), 8000);
		}
	}

	/** Classify and add an error, using known patterns for user-friendly messages */
	addError(rawError: string): void {
		for (const known of KNOWN_ERRORS) {
			if (known.pattern.test(rawError)) {
				this.add('error', known.title, known.message);
				return;
			}
		}
		// Fallback: show the raw error but cleaned up
		const cleaned = rawError.replace(/^(ApiRequestError|Error):\s*/i, '').slice(0, 200);
		this.add('error', 'Execution Error', cleaned);
	}

	dismiss(id: string): void {
		this.notifications = this.notifications.filter(n => n.id !== id);
	}

	clear(): void {
		this.notifications = [];
	}
}

export const notificationStore = new NotificationStore();

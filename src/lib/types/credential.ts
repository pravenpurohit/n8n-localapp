/** Credential stored in n8n */
export interface Credential {
	id: string;
	name: string;
	type: string;
	createdAt: string;
	updatedAt: string;
}

/** Credential with decrypted data (for editing) */
export interface CredentialWithData extends Credential {
	data: Record<string, unknown>;
}

/** Schema for a credential type's fields */
export interface CredentialSchema {
	type: string;
	properties: CredentialSchemaField[];
}

export interface CredentialSchemaField {
	displayName: string;
	name: string;
	type: 'string' | 'number' | 'boolean' | 'options';
	required: boolean;
	default?: unknown;
	options?: Array<{ name: string; value: string }>;
	typeOptions?: { password?: boolean };
}

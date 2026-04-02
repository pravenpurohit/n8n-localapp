import { apiClient } from './client';

export interface AuditResult {
	risk: 'low' | 'medium' | 'high';
	sections: AuditSection[];
}

export interface AuditSection {
	title: string;
	description: string;
	recommendations: AuditRecommendation[];
}

export interface AuditRecommendation {
	title: string;
	description: string;
	risk: 'low' | 'medium' | 'high';
}

export async function runAudit(): Promise<AuditResult> {
	return apiClient.post<AuditResult>('/audit', {});
}

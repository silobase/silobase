export interface AuditEventType {
    method: string;
    url: string;
    statusCode: number;
    user?: string | null;
    apiKeyRole?: string | null;
    ip: string;
    timestamp: string;
    responseTimeMs: number;
    headers: Record<string, string | undefined>;
    body?: any;
}


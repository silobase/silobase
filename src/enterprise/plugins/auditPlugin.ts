import fp from "fastify-plugin";
import fs from "fs";
import path from "path";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AuditEventType } from "../../types/auditEventType.ts";
import config from "../../config/indexConfig.ts";
import { getKeyPermission } from "../../utils/keyPermissionFilter.ts";

function getAuditFilePath(baseDir: string) {
  return path.join(baseDir, "audit.log");
}

export default fp(async (app: FastifyInstance) => {
  const logToDb = config.auditLogToDb;
  const baseLogDir = config.auditLogDir;

  fs.mkdirSync(baseLogDir, { recursive: true });
  const logFilePath = getAuditFilePath(baseLogDir);
  const stream = fs.createWriteStream(logFilePath, { flags: "a" });

  app.addHook("onRequest", async (request) => {
    (request as any).startTime = process.hrtime.bigint();
  });

  app.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const start = (request as any).startTime || process.hrtime.bigint();
      const durationNs = process.hrtime.bigint() - start;
      const responseTimeMs = Number(durationNs) / 1_000_000;

      const apiKeyRole = getKeyPermission(request.headers["x-api-key"] as string | undefined);
      const headers: Record<string, string | undefined> = {
        "user-agent": request.headers["user-agent"],
        referer: request.headers["referer"],
        origin: request.headers["origin"],
        "accept-language": request.headers["accept-language"],
      };

      const event: AuditEventType = {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        user: (request as any).user?.id ?? null,
        apiKeyRole,
        ip: request.ip,
        timestamp: new Date().toISOString(),
        responseTimeMs,
        headers,
        body: request.body,
      };

      if (logToDb && (app as any).db) {
        try {
          await (app as any).db("audit_logs").insert({
            timestamp: event.timestamp,
            body: JSON.stringify(event),
          });
          return;
        } catch (_) {}
      }

      stream.write(JSON.stringify(event) + "\n");
    } catch (_) {}
  });

  app.addHook("onClose", async () => {
    try {
      stream.end();
    } catch (_) {}
  });
});

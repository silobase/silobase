import fs from "fs";
import path from "path";
import readline from "readline";
import { FastifyPluginAsync } from "fastify";
import config from "../../config/indexConfig.ts";

const auditRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/audit", async (request, reply) => {
    if (request.permission !== "full") {
      return reply.code(403).send({ error: "Forbidden: Full access required" });
    }

    const { limit = 100, since } = request.query as { limit?: number; since?: string };
    const db = (fastify as any).db;
    const useDb = config.auditLogToDb && db;
    const results: any[] = [];

    console.log(config.auditLogToDb)

    try {
      // --- If DB Mode ---
      if (useDb) {
        console.log("Using DB for audit logs");
        let query = db("audit_logs").select("*").orderBy("id", "desc").limit(limit);

        if (since) {
          query = query.where("timestamp", ">=", new Date(since));
        }

        const rows = await query;
        for (const r of rows) {
          try {
            results.push({ id: r.id, timestamp: r.timestamp, ...JSON.parse(r.body) });
          } catch {
            results.push({ id: r.id, timestamp: r.timestamp, raw: r.body });
          }
        }

        return reply.code(200).send({ source: "db", count: results.length, results });
      }

      // --- Otherwise: File Mode ---
      const baseDir = config.auditLogDir;
      console.log(baseDir);

      const files = fs
        .readdirSync(baseDir)
        .filter((f) => f.startsWith("audit") && f.endsWith(".log"))
        .sort()
        .reverse(); // newest first

      for (const file of files) {
        const filePath = path.join(baseDir, file);
        const rl = readline.createInterface({
          input: fs.createReadStream(filePath),
          crlfDelay: Infinity,
        });

        for await (const line of rl) {
          try {
            const event = JSON.parse(line);
            if (since && new Date(event.timestamp) < new Date(since)) continue;
            results.push(event);
          } catch {
            continue;
          }

          if (results.length >= Number(limit)) break;
        }

        rl.close();
        if (results.length >= Number(limit)) break;
      }

      return reply.code(200).send({
        source: "file",
        count: results.length,
        results,
      });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: "Failed to retrieve audit logs" });
    }
  });
};

export default auditRoutes;

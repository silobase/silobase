import createCoreApp from "../core/app.ts";
import auditRoute from "./routes/auditRoute.ts";

export default async function createEnterpriseApp() {
    const app = await createCoreApp();

    app.register(auditRoute, {prefix: "/enterprise"});

    app.register(await import("./plugins/auditPlugin.ts").then(m => m.default));
    app.decorate("isEnterprise", true);
    app.log.info("🚀 Enterprise features enabled");

    return app;
}
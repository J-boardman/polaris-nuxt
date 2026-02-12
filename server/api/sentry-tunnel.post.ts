const SENTRY_HOST = process.env.SENTRY_HOST;
const SENTRY_PROJECT_ID = process.env.SENTRY_PROJECT_ID as string;
export default defineEventHandler(async (event) => {
  try {
    const body = await readRawBody(event, false);
    if (!body) {
      throw createError({ statusCode: 400, statusMessage: "Missing body" });
    }

    const envelope = typeof body === "string" ? body : new TextDecoder().decode(body);
    const piece = envelope.split("\n")[0];
    if (!piece) {
      throw createError({ statusCode: 400, statusMessage: "Missing piece" });
    }
    const header = JSON.parse(piece);
    const dsn = new URL(header["dsn"]);
    const project_id = dsn.pathname?.replace("/", "");

    if (dsn.hostname !== SENTRY_HOST) {
      throw createError({ statusCode: 400, statusMessage: `Invalid sentry hostname: ${dsn.hostname}` });
    }
    if (!project_id || SENTRY_PROJECT_ID !== project_id) {
      throw createError({ statusCode: 400, statusMessage: `Invalid sentry project id: ${project_id}` });
    }

    const upstream_sentry_url = `https://${SENTRY_HOST}/api/${project_id}/envelope/`;
    await $fetch(upstream_sentry_url, {
      method: "POST",
      body,
    });

    return {};
  } catch (e) {
    console.error("error tunneling to sentry", e);
    throw createError({ statusCode: 500, statusMessage: "Error tunneling to sentry" });
  }
});

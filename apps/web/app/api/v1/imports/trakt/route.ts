import { parseTraktExport, parseTraktJson } from "../../../../../lib/trakt-export";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) return Response.json({ error: { code: "FILE_REQUIRED", message: "Upload a Trakt ZIP or JSON export." } }, { status: 400 });
      if (file.size > 25 * 1024 * 1024) return Response.json({ error: { code: "FILE_TOO_LARGE", message: "The import file must be smaller than 25 MB." } }, { status: 413 });
      const buffer = await file.arrayBuffer();
      const summary = file.name.toLowerCase().endsWith(".json") ? parseTraktJson(JSON.parse(new TextDecoder().decode(buffer)), file.name) : await parseTraktExport(buffer);
      return Response.json({ preview: true, summary });
    }

    const body = await request.json() as { json?: unknown; filename?: string };
    if (body.json === undefined) return Response.json({ error: { code: "IMPORT_DATA_REQUIRED", message: "No Trakt export data was provided." } }, { status: 400 });
    return Response.json({ preview: true, summary: parseTraktJson(body.json, body.filename ?? "upload.json") });
  } catch {
    return Response.json({ error: { code: "INVALID_TRAKT_EXPORT", message: "The file could not be read as a Trakt export." } }, { status: 400 });
  }
}

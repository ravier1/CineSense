export function GET() {
  return Response.json({
    ok: true,
    service: "cinesense-api",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
}

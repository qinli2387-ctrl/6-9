import { PlacementValidationError, scorePlacement, type PlacementSubmission } from "@/lib/placement";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as PlacementSubmission;
    return Response.json({ ok: true, result: scorePlacement(payload) });
  } catch (error) {
    if (error instanceof PlacementValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "提交内容无效" }, { status: 400 });
    }
    throw error;
  }
}

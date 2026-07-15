import type { Lead, StoreResult } from "./schemas";

export async function saveLead(lead: Lead): Promise<StoreResult> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    return { success: false, error: "GOOGLE_SHEETS_WEBHOOK_URL not configured" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    if (!res.ok) {
      return { success: false, error: `Google Sheets webhook returned HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to save lead: ${message}` };
  }
}

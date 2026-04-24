import { requestJson, requestTbxExport } from "./client";

export async function importTbx(tbxContent: string) {
  return requestJson<{ conceptsImported: number; termsImported: number }>("/tbx/import", {
    method: "POST",
    body: JSON.stringify({ tbxContent }),
  });
}

export async function exportTbx() {
  return requestTbxExport();
}

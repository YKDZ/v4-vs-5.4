import type { TbxImportResult } from '@termbase/shared';
import { apiDownload, apiRequest } from './client';

export async function exportTbx() {
  return apiDownload('/api/v1/tbx/export');
}

export async function importTbx(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest<TbxImportResult>('/api/v1/tbx/import', {
    method: 'POST',
    body: formData,
  });
}

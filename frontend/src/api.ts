import type { CallDraft, CallRecord, StageResult } from './types';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(`${API_BASE}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } }); }
  catch { throw new Error('Cannot reach the backend. Check VITE_API_BASE_URL and confirm the Render/local API is running.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}
export const api = {
  health: () => request<{ok:boolean; storage:string; llmConfigured:boolean}>('/health'),
  listCalls: () => request<{calls:CallRecord[]}>('/api/calls'),
  getCall: (id:string) => request<{call:CallRecord}>(`/api/calls/${id}`),
  startCall: (draft:CallDraft) => request<{call:CallRecord}>('/api/calls', {method:'POST', body:JSON.stringify(draft)}),
  saveStage: (id:string, result:StageResult, currentStage:number) => request<{stageResult:StageResult; call:CallRecord}>(`/api/calls/${id}/stages`, {method:'POST', body:JSON.stringify({...result,current_stage:currentStage})}),
  closeCall: (id:string, data:{outcome:string; next_step:string; next_step_at:string; prospect_words:string; summary:string}) => request<{call:CallRecord}>(`/api/calls/${id}/close`, {method:'POST', body:JSON.stringify(data)}),
  summarise: (id:string) => request<{summary:string; follow_up:string; model:string}>('/api/ai/summarise', {method:'POST', body:JSON.stringify({call_id:id})})
};
export type Stage = { number: number; name: string; purpose: string; examples: string[]; events: string[] };
export type StageResult = { id?: string; stage_number: number; stage_name: string; event: string; prospect_words?: string; notes?: string; created_at?: string };
export type CallRecord = { id: string; prospect_name: string; company_name: string; prospect_role?: string; call_type?: string; status: 'active'|'completed'; current_stage: number; outcome?: string; next_step?: string; next_step_at?: string; prospect_words?: string; summary?: string; created_at: string; updated_at?: string; stage_results?: StageResult[] };
export type CallDraft = { prospect_name: string; company_name: string; prospect_role: string; call_type: string };

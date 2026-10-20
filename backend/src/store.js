import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_PROJECT') && !supabaseKey.includes('YOUR_SUPABASE')
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
const memoryCalls = new Map();
const memoryResults = new Map();
export const storageMode = supabase ? 'supabase' : 'memory';
const now = () => new Date().toISOString();
function enrich(call) { return {...call, stage_results: (memoryResults.get(call.id) || []).slice().sort((a,b)=>a.stage_number-b.stage_number || String(a.created_at).localeCompare(String(b.created_at)))}; }

export async function listCalls() {
 if (!supabase) return [...memoryCalls.values()].map(enrich).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 const {data,error}=await supabase.from('calls').select('*, call_stage_results(*)').order('created_at',{ascending:false});
 if(error) throw error;
 return (data||[]).map(row=>({...row,stage_results:(row.call_stage_results||[]).sort((a,b)=>a.stage_number-b.stage_number)}));
}
export async function getCall(id) {
 if (!supabase) { const c=memoryCalls.get(id); return c ? enrich(c) : null; }
 const {data,error}=await supabase.from('calls').select('*, call_stage_results(*)').eq('id',id).maybeSingle();
 if(error) throw error;
 return data ? {...data,stage_results:(data.call_stage_results||[]).sort((a,b)=>a.stage_number-b.stage_number)} : null;
}
export async function createCall(input) {
 const record={id:randomUUID(),prospect_name:input.prospect_name||'',company_name:input.company_name||'',prospect_role:input.prospect_role||'',call_type:input.call_type||'First call',status:'active',current_stage:1,outcome:null,next_step:'',next_step_at:null,prospect_words:'',summary:'',created_at:now(),updated_at:now(),closed_at:null};
 if(!supabase){memoryCalls.set(record.id,record);memoryResults.set(record.id,[]);return enrich(record);}
 const {data,error}=await supabase.from('calls').insert(record).select().single();if(error)throw error;return {...data,stage_results:[]};
}
export async function saveStage(callId,input) {
 const call=await getCall(callId); if(!call) return null;
 const result={id:randomUUID(),call_id:callId,stage_number:Number(input.stage_number),stage_name:String(input.stage_name||''),event:String(input.event||''),prospect_words:String(input.prospect_words||''),notes:String(input.notes||''),created_at:now()};
 if(!Number.isInteger(result.stage_number)||result.stage_number<1||result.stage_number>8) throw new Error('stage_number must be between 1 and 8');
 if(!supabase){const arr=memoryResults.get(callId)||[];arr.push(result);memoryResults.set(callId,arr);const c=memoryCalls.get(callId);c.current_stage=Math.min(8,Math.max(1,Number(input.current_stage)||result.stage_number+1));if(result.prospect_words)c.prospect_words=result.prospect_words;c.updated_at=now();memoryCalls.set(callId,c);return {stageResult:result,call:enrich(c)};}
 const {error:insertError}=await supabase.from('call_stage_results').insert(result);if(insertError)throw insertError;
 const updates={current_stage:Math.min(8,Math.max(1,Number(input.current_stage)||result.stage_number+1)),updated_at:now()};if(result.prospect_words)updates.prospect_words=result.prospect_words;
 const {data,error}=await supabase.from('calls').update(updates).eq('id',callId).select().single();if(error)throw error;
 return {stageResult:result,call:await getCall(data.id)};
}
export async function closeCall(callId,input) {
 const call=await getCall(callId);if(!call)return null;
 const updates={status:'completed',outcome:String(input.outcome||'not_logged'),next_step:String(input.next_step||''),next_step_at:input.next_step_at||null,prospect_words:String(input.prospect_words||call.prospect_words||''),summary:String(input.summary||''),updated_at:now(),closed_at:now()};
 if(!supabase){const c={...memoryCalls.get(callId),...updates};memoryCalls.set(callId,c);return enrich(c);}
 const {data,error}=await supabase.from('calls').update(updates).eq('id',callId).select().single();if(error)throw error;return await getCall(data.id);
}
export async function getCallForAI(id) { return await getCall(id); }

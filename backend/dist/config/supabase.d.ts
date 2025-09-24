import { SupabaseClient } from '@supabase/supabase-js';
export declare const supabase: SupabaseClient<any, "public", "public", any, any>;
export interface Template {
    id: number;
    created_at: string;
    title: string;
    description: string;
    difficulty: string;
    type: string;
    script: string;
}
export default supabase;
//# sourceMappingURL=supabase.d.ts.map
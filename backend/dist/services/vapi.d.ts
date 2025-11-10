import { Template } from '../config/supabase';
export interface CreateAssistantRequest {
    template: string;
    accountType: string;
}
export interface TemplateConfig {
    persona: string;
    difficulty: string;
    insuranceType: string;
}
export interface VapiAssistant {
    id: string;
    name: string;
    model: {
        provider: string;
        model: string;
        messages: Array<{
            role: string;
            content: string;
        }>;
    };
    voice?: {
        provider: string;
        voiceId: string;
    };
    firstMessage?: string;
}
export declare class VapiService {
    private readonly baseUrl;
    constructor();
    private getApiKey;
    private getHeaders;
    private generateSystemPromptFromTemplate;
    private generateSystemPrompt;
    private getTemplateConfig;
    private getTemplateScript;
    updateAssistantWithTemplate(data: {
        template: Template;
        accountType: string;
    }): Promise<VapiAssistant>;
    updateAssistant(request: CreateAssistantRequest): Promise<VapiAssistant>;
    private generateFirstMessage;
    createWebCall(assistantId: string): Promise<any>;
    createCall(assistantId: string, phoneNumber?: string): Promise<any>;
    getCall(callId: string): Promise<any>;
    deleteAssistant(assistantId: string): Promise<void>;
}
export declare const vapiService: VapiService;
//# sourceMappingURL=vapi.d.ts.map
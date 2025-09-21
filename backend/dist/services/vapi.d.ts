export interface CreateAssistantRequest {
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
    voice: {
        provider: string;
        voiceId: string;
    };
    firstMessage?: string;
}
export declare class VapiService {
    private readonly apiKey;
    private readonly baseUrl;
    constructor();
    private getHeaders;
    private generateSystemPrompt;
    createAssistant(request: CreateAssistantRequest): Promise<VapiAssistant>;
    private generateFirstMessage;
    createCall(assistantId: string, phoneNumber?: string): Promise<any>;
}
export declare const vapiService: VapiService;
//# sourceMappingURL=vapi.d.ts.map
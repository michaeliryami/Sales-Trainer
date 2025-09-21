"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vapiService = exports.VapiService = void 0;
const axios_1 = __importDefault(require("axios"));
const VAPI_BASE_URL = 'https://api.vapi.ai';
const VAPI_API_KEY = process.env.VAPI_API_KEY;
if (!VAPI_API_KEY) {
    throw new Error('VAPI_API_KEY is not set in environment variables');
}
class VapiService {
    constructor() {
        this.apiKey = VAPI_API_KEY;
        this.baseUrl = VAPI_BASE_URL;
    }
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }
    generateSystemPrompt(persona, difficulty, insuranceType) {
        const difficultyInstructions = {
            easy: "Be friendly and receptive. Ask basic questions and show interest in the insurance product.",
            medium: "Be moderately skeptical. Ask some detailed questions about coverage and pricing. Show some objections but be reasonable.",
            hard: "Be quite skeptical and demanding. Ask tough questions about exclusions, claim processes, and compare with competitors. Raise several objections.",
            expert: "Be very challenging. Ask complex questions about policy details, legal implications, and industry standards. Be highly analytical and difficult to convince."
        };
        return `You are roleplaying as a potential ${insuranceType} insurance customer with the following persona: ${persona}

Difficulty Level: ${difficulty}
${difficultyInstructions[difficulty] || difficultyInstructions.medium}

Insurance Type: ${insuranceType}

Instructions:
- Stay in character as the customer persona described above
- Ask relevant questions about ${insuranceType} insurance
- Express concerns and objections appropriate to your difficulty level
- Be realistic in your responses and reactions
- Don't make it too easy for the salesperson
- Show genuine interest when they address your concerns well
- End the call naturally when you're satisfied or if you're not convinced

Keep responses conversational and realistic. You are NOT the insurance agent - you are the potential customer being sold to.`;
    }
    async createAssistant(request) {
        try {
            const systemPrompt = this.generateSystemPrompt(request.persona, request.difficulty, request.insuranceType);
            const assistantData = {
                name: `${request.insuranceType} Insurance Customer - ${request.difficulty}`,
                model: {
                    provider: "openai",
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        }
                    ],
                    temperature: 0.7
                },
                voice: {
                    provider: "11labs",
                    voiceId: "21m00Tcm4TlvDq8ikWAM"
                },
                firstMessage: this.generateFirstMessage(request.persona, request.insuranceType)
            };
            const response = await axios_1.default.post(`${this.baseUrl}/assistant`, assistantData, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            console.error('Error creating VAPI assistant:', error);
            if (error.response) {
                throw new Error(`VAPI API Error: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to create assistant');
        }
    }
    generateFirstMessage(persona, insuranceType) {
        const greetings = [
            `Hello! I heard you might be able to help me with ${insuranceType} insurance?`,
            `Hi there, I'm looking into ${insuranceType} insurance options.`,
            `Good day! I was told you could help me understand ${insuranceType} insurance better.`,
            `Hello, I'm interested in learning more about ${insuranceType} insurance.`
        ];
        const randomIndex = Math.floor(Math.random() * greetings.length);
        return greetings[randomIndex];
    }
    async createCall(assistantId, phoneNumber) {
        try {
            const callData = {
                assistantId,
                phoneNumberId: phoneNumber || undefined,
            };
            const response = await axios_1.default.post(`${this.baseUrl}/call`, callData, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            console.error('Error creating VAPI call:', error);
            if (error.response) {
                throw new Error(`VAPI API Error: ${error.response.data?.message || error.message}`);
            }
            throw new Error('Failed to create call');
        }
    }
}
exports.VapiService = VapiService;
exports.vapiService = new VapiService();
//# sourceMappingURL=vapi.js.map
export type Environment = 'development' | 'production';
export interface AppConfig {
    env: Environment;
    isDevelopment: boolean;
    isProduction: boolean;
    port: number;
    corsOrigins: string[];
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    supabase: {
        url: string;
        anonKey: string;
    };
    openai: {
        apiKey: string;
    };
    vapi: {
        apiKey: string;
        publicKey: string;
    };
}
export declare const config: AppConfig;
//# sourceMappingURL=environment.d.ts.map
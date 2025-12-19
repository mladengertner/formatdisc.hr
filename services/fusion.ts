import { GeminiClient } from './geminiWrapper';

export const fusionClient = new GeminiClient();

/**
 * Sends a system update to Fusion chat
 */
export async function sendTelemetryUpdate(payload: any) {
    try {
        await fusionClient.sendMessage({
            channel: 'shell-status',
            message: JSON.stringify(payload, null, 2),
        });
    } catch (err) {
        console.error('[Fusion] Failed to send telemetry update:', err);
    }
}

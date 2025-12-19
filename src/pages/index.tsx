import { ShellOrchestrator } from "../components/enterprise/ShellOrchestrator";

// Basic Dashboard Stub using internal SSE for consistency, if components were separated
export function Dashboard() {
    return null;
}

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pb-12 flex flex-col items-center justify-center">
            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-6 text-center text-3xl font-bold text-emerald-200 tracking-tight">
                    Slavko Enterprise Shell v3
                </h1>
                <p className="text-center text-emerald-100/60 mb-8 max-w-2xl mx-auto">
                    Full-Stack Audit-Proof Environment · Fusion Broker · Real-time Telemetry
                </p>

                <ShellOrchestrator />
            </div>
        </main>
    );
}

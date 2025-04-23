import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function TaskAnalyzerPage() {
    const session = await auth.api.getSession({
        headers: await headers() 
    });

    if (!session || !session.user) {
        return null;
    }

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Task Analyzer</h1>
                <div className="space-y-4">
                    {/* Content will be added here */}
                </div>
            </section>
        </main>
    )
} 
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TaskAnalyzer } from "./client";

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
                <TaskAnalyzer userId={session.user.id} />
            </section>
        </main>
    );
} 
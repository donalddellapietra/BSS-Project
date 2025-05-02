import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ListTodo, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <main className="py-8 px-4">
            <section className="container mx-auto max-w-4xl text-center">
                <h1 className="text-4xl font-bold mb-4">Subtask Analyzer</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Transform your complex tasks into manageable subtasks with AI
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Smart Analysis
                            </CardTitle>
                            <CardDescription>
                                Upload a task or paste text to automatically generate subtasks
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2">
                                <ListTodo className="h-5 w-5" />
                                Task Management
                            </CardTitle>
                            <CardDescription>
                                Organize and track your tasks with due dates and completion status
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                <Link href="/task-analyzer">
                    <Button size="lg" className="gap-2">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </section>
        </main>
    )
}

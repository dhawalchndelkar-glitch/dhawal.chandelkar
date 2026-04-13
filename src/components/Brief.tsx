import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Workflow, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Layers, 
  MessageSquare,
  RefreshCcw,
  Code2,
  Bug
} from "lucide-react";

export default function Brief() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">System Architecture & Design</h1>
        <p className="text-muted-foreground text-lg">How Troopod handles AI-driven landing page personalization.</p>
      </div>

      {/* Flow Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Workflow className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">The Workflow</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "1. Ad Ingestion", desc: "Extracts visual and textual intent from the ad creative (URL, description, or uploaded image/video)." },
            { title: "2. LP Contextualization", desc: "Fetches and analyzes the existing landing page structure and copy." },
            { title: "3. Synthesis & CRO", desc: "Gemini 3.1 Pro merges both contexts to generate high-converting, personalized copy." }
          ].map((item, i) => (
            <Card key={i} className="border-none bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Agent Design */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Agent Design</h2>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Troopod uses a <strong>Multi-Stage Reasoning Agent</strong> powered by Gemini 3.1 Pro. Instead of a single prompt, the agent follows a structured path:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex gap-3 items-start p-4 border rounded-xl">
              <Layers className="w-5 h-5 text-primary mt-1" />
              <div>
                <span className="font-bold block">Contextual Grounding</span>
                <span className="text-sm text-muted-foreground text-balance">The agent is strictly grounded in the provided HTML to prevent hallucinating features the product doesn't have.</span>
              </div>
            </li>
            <li className="flex gap-3 items-start p-4 border rounded-xl">
              <Zap className="w-5 h-5 text-primary mt-1" />
              <div>
                <span className="font-bold block">CRO Heuristics</span>
                <span className="text-sm text-muted-foreground text-balance">Integrated Conversion Rate Optimization principles (Scarcity, Social Proof, Benefit-First) are injected into the system instruction.</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <Separator />

      {/* Handling Challenges */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Handling AI Challenges</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Hallucinations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We use <strong>Schema-First Generation</strong>. By enforcing a strict JSON schema, we force the model to categorize its thoughts, reducing the chance of "drifting" into non-existent features.
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Broken UI
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Instead of generating raw HTML (which is brittle), the agent generates <strong>Structured Content</strong> (JSON). Our React components then render this content safely within a pre-built, robust design system.
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Inconsistent Outputs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We use <strong>System Instructions</strong> to define a consistent "Brand Voice" and "CRO Expert" persona, ensuring that even with different inputs, the quality and tone remain professional.
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="pt-8 text-center text-sm text-muted-foreground">
        Built for the Troopod AI PM Assignment
      </footer>
    </div>
  );
}

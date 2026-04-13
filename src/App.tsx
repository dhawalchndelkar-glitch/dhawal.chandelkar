/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Personalizer from "@/src/components/Personalizer";
import Brief from "@/src/components/Brief";
import { Sparkles, FileText } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
            <div className="bg-primary text-primary-foreground p-1 rounded">
              <Sparkles className="w-6 h-6" />
            </div>
            Troopod
          </div>
          <nav className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline underline-offset-4">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="container py-8 max-w-7xl mx-auto">
        <Tabs defaultValue="personalizer" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="personalizer" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Personalizer
              </TabsTrigger>
              <TabsTrigger value="brief" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Brief Explanation
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="personalizer" className="space-y-4">
            <Personalizer />
          </TabsContent>
          
          <TabsContent value="brief">
            <Brief />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


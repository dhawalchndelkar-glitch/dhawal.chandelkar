import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ArrowRight, Globe, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Upload, X, FileVideo, FileImage } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeAd, generatePersonalization, type AdAnalysis, type PersonalizationPlan, type FileData } from "@/src/lib/gemini";

export default function Personalizer() {
  const [adCreative, setAdCreative] = useState("");
  const [adFile, setAdFile] = useState<{ base64: string; mimeType: string; name: string; preview: string } | null>(null);
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "analyzing-ad" | "fetching-lp" | "personalizing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PersonalizationPlan | null>(null);
  const [adAnalysis, setAdAnalysis] = useState<AdAnalysis | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size too large. Please upload a file smaller than 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        setAdFile({ 
          base64, 
          mimeType: file.type, 
          name: file.name,
          preview: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    if (adFile?.preview) URL.revokeObjectURL(adFile.preview);
    setAdFile(null);
  };

  const handlePersonalize = async () => {
    if ((!adCreative && !adFile) || !landingPageUrl) {
      setError("Please provide an ad creative (text or file) and a landing page URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setAdAnalysis(null);

    try {
      // Step 1: Analyze Ad
      setStep("analyzing-ad");
      const fileData: FileData | undefined = adFile ? { base64: adFile.base64, mimeType: adFile.mimeType } : undefined;
      const analysis = await analyzeAd(adCreative, adCreative.startsWith("http"), fileData);
      setAdAnalysis(analysis);

      // Step 2: Fetch Landing Page
      setStep("fetching-lp");
      const lpResponse = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: landingPageUrl }),
      });
      
      if (!lpResponse.ok) {
        const errData = await lpResponse.json();
        throw new Error(errData.error || "Failed to fetch landing page.");
      }
      
      const { html } = await lpResponse.json();

      // Step 3: Personalize
      setStep("personalizing");
      const personalization = await generatePersonalization(analysis, html, landingPageUrl);
      setResult(personalization);
      
      setStep("idle");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Personalize Your Landing Page</h1>
        <p className="text-muted-foreground text-lg">Align your landing page with your ad creative in seconds using AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Ad Creative
            </CardTitle>
            <CardDescription>Paste a link to your ad or describe the creative.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ad-input">Ad URL or Description</Label>
              <Textarea
                id="ad-input"
                placeholder="e.g., https://facebook.com/ads/123 or 'A video ad showing a happy family using our travel app...'"
                className="min-h-[80px] resize-none"
                value={adCreative}
                onChange={(e) => setAdCreative(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or upload file</span>
              </div>
            </div>

            {!adFile ? (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">Image or Video (Max 10MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <div className="relative rounded-lg border p-2 bg-muted/30 group">
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={removeFile}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded bg-background border flex items-center justify-center overflow-hidden">
                    {adFile.mimeType.startsWith("image") ? (
                      <img src={adFile.preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FileVideo className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{adFile.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">{adFile.mimeType.split("/")[1]}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Landing Page
            </CardTitle>
            <CardDescription>The existing page you want to personalize.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lp-url">Landing Page URL</Label>
              <Input
                id="lp-url"
                type="url"
                placeholder="https://yourbrand.com/landing-page"
                value={landingPageUrl}
                onChange={(e) => setLandingPageUrl(e.target.value)}
              />
            </div>
            <Button 
              className="w-full h-12 text-lg font-semibold group" 
              onClick={handlePersonalize}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {step === "analyzing-ad" && "Analyzing Ad..."}
                  {step === "fetching-lp" && "Fetching Landing Page..."}
                  {step === "personalizing" && "Personalizing..."}
                </>
              ) : (
                <>
                  Personalize Now
                  <Sparkles className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <Separator />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Analysis Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ad Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Target Audience</Label>
                      <p className="text-sm font-medium">{adAnalysis?.targetAudience}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Tone & Style</Label>
                      <p className="text-sm font-medium">{adAnalysis?.tone} • {adAnalysis?.visualStyle}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Key Benefits</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {adAnalysis?.keyBenefits.map((benefit, i) => (
                          <Badge key={i} variant="secondary">{benefit}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      CRO Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.croImprovements.map((imp, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-primary font-bold">•</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Personalized Preview</h2>
                  <Badge variant="outline" className="px-3 py-1">Enhanced Version</Badge>
                </div>

                <div className="rounded-xl border shadow-2xl overflow-hidden bg-white text-black">
                  {/* Mock Browser Header */}
                  <div className="bg-muted px-4 py-2 border-bottom flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4 bg-background rounded px-3 py-1 text-xs text-muted-foreground truncate">
                      {landingPageUrl}
                    </div>
                  </div>

                  {/* Personalized Hero Section */}
                  <div className="relative min-h-[500px] flex items-center justify-center p-8 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
                    </div>

                    <div className="relative z-10 max-w-2xl text-center space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                          Personalized for you
                        </Badge>
                        <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                          {result.newHeadline}
                        </h1>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-600"
                      >
                        {result.newSubheadline}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                      >
                        <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full shadow-xl hover:scale-105 transition-transform">
                          {result.newCtaText}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium rounded-full">
                          Learn More
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Reasoning & Visual Direction Section */}
                  <div className="bg-muted/50 p-8 border-t grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Reasoning
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{result.personalizationReasoning}"
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 flex items-center gap-2 text-primary">
                        <ImageIcon className="w-4 h-4" />
                        Visual Direction
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Recommended Hero Image:</span> {result.heroImagePrompt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

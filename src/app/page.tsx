"use client"

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowRight, Code, Download, Github, Play } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("create");

  const features = [
    {
      title: "Natural Language Input",
      description: "Describe your math animations in plain English - no coding required",
      icon: Code
    },
    {
      title: "Instant Generation",
      description: "Get your custom math animations in seconds using GPT-4",
      icon: Play
    },
    {
      title: "Easy Downloads",
      description: "Download and share your animations in popular video formats",
      icon: Download
    }
  ];

  const handleSubmit = async () => {
    setError(null);
    setVideoUrl(null);
    setLoading(true);

    try {
      // API calls remain the same as in original code
      const codeResponse = await fetch("https://api.animo.video/v1/code/generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, model: "gpt-4o" }),
      });

      if (!codeResponse.ok) throw new Error("Failed to generate code. Please try again.");

      const codeData = await codeResponse.json();
      const pythonCode = codeData.code.replace(/```python|```/g, "").trim();

      const renderResponse = await fetch("https://api.animo.video/v1/video/rendering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: pythonCode,
          file_name: "GenScene.py",
          file_class: "GenScene",
          iteration: 55489,
          project_name: "GenScene",
        }),
      });

      if (!renderResponse.ok) throw new Error("Failed to render video. Please try again.");

      const renderData = await renderResponse.json();
      setVideoUrl(renderData.video_url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const ExamplePrompts = [
    "Show the quadratic formula derivation step by step",
    "Visualize the unit circle and trigonometric functions",
    "Demonstrate the Pythagorean theorem proof"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm fixed w-full z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MathAnimationGPT
            </h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Create Beautiful Math Animations with AI
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Transform your mathematical concepts into engaging animations using natural language. 
            Perfect for educators, students, and math enthusiasts.
          </p>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="create" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Animation</TabsTrigger>
              <TabsTrigger value="examples">Example Prompts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <Card>
                <CardContent className="pt-6">
                  <Textarea
                    placeholder="Describe your math animation in detail (e.g., 'Show a step-by-step visualization of solving the quadratic equation x² + 2x + 1 = 0')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="mb-4 min-h-[120px]"
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading || !query} 
                    className="w-full"
                  >
                    {loading ? (
                      "Generating Animation..."
                    ) : (
                      <>
                        Generate Animation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    {ExamplePrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto py-4 px-4"
                        onClick={() => {
                          setQuery(prompt);
                          setActiveTab("create");
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Video Display */}
          {videoUrl && (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <video src={videoUrl} controls className="w-full" />
                <div className="p-4 border-t bg-gray-50">
                  <Button asChild variant="outline" className="w-full">
                    <a href={videoUrl} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download Animation
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <feature.icon className="h-8 w-8 mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          © 2024 MathAnimationGPT. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
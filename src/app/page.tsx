"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ArrowRight, Code2, Download, Loader, Sparkles, Video } from "lucide-react"
import { useRef, useState } from "react"

const examplePrompts = [
    "red rotating 3d cube",
    "sine wave with amplitude 1 and frequency 2",
]

interface ProcessStepProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  isActive: boolean
  isComplete: boolean
}

const ProcessStep = ({ icon: Icon, title, description, isActive, isComplete }: ProcessStepProps) => (
  <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 ${
    isActive ? 'bg-violet-500/10 border border-violet-500/20' :
    isComplete ? 'bg-gray-800/20 border border-gray-700' :
    'bg-gray-900/50 border border-gray-800'
  }`}>
    <div className={`p-2 rounded-full ${
      isActive ? 'bg-violet-500 text-white' :
      isComplete ? 'bg-gray-700 text-gray-300' :
      'bg-gray-800 text-gray-500'
    }`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h4 className={`font-medium ${
        isActive ? 'text-violet-400' :
        isComplete ? 'text-gray-300' :
        'text-gray-500'
      }`}>{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
)

const FadeInOut: React.FC<{ show: boolean, children: React.ReactNode }> = ({ show, children }) => (
  <div
    className={`transition-all duration-300 ${
      show
        ? 'opacity-100 transform translate-y-0'
        : 'opacity-0 transform translate-y-5 pointer-events-none'
    }`}
  >
    {children}
  </div>
);

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const videoRef = useRef(null)

  interface SimulateProgress {
    (step: number): NodeJS.Timeout
  }

  const simulateProgress: SimulateProgress = (step) => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, step === 1 ? 100 : 100)
    return interval
  }

  const generateAnimation = async () => {
    setLoading(true)
    setCurrentStep(1)
    setError(null)
    setVideoUrl(null)

    const codeInterval = simulateProgress(1)

    try {
      const response = await fetch('/api/generateAnimation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate animation. Please try again.');
      }

      clearInterval(codeInterval)
      setProgress(100)

      const data = await response.json();
      const pythonCode = data.code;
      setCode(pythonCode);

      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep(2)
      setProgress(0)
      const videoInterval = simulateProgress(2)

      if (!data.videoUrl) {
        throw new Error('No video URL received from the server.');
      }

      clearInterval(videoInterval)
      setProgress(100)
      setVideoUrl(data.videoUrl)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-inter relative">
      <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative">
        <div className="container mx-auto px-4 pt-12">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-semibold">VisualMath AI</h1>
            </div>
            <Button
              variant="ghost"
              className="text-gray-400"
              onClick={() => window.open('https://x.com/archiexzzz', '_blank')}
            >
              @archiexzzz
            </Button>
          </div>

          <div className="text-center mb-20">
            <h2 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500">
              English to Math Animations
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              powered by Manim Engine + gpt-4o.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex flex-wrap gap-3 justify-center">
              {examplePrompts.map((examplePrompt, index) => (
              <Button
                key={index}
                variant="ghost"
                className="bg-gray-900/50 hover:bg-gray-800/50 hover:text-white border border-gray-800 text-sm px-4 py-2 rounded-xl transition-all duration-200"
                onClick={() => setPrompt(examplePrompt)}
              >
                {examplePrompt}
              </Button>
              ))}
            </div>

            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800 mb-8 rounded-2xl overflow-hidden shadow-2xl">
              <CardContent className="p-8">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the mathematical concept you want to visualize..."
                  className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 mb-6 p-4 rounded-xl min-h-[120px] resize-none focus:ring-2 focus:ring-violet-500 transition-all duration-200 text-lg font-bold text-white"
                  style={{ fontSize: '16px' }}
                  disabled={loading}
                />
                <Button
                  onClick={generateAnimation}
                  disabled={loading || !prompt}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-6 rounded-xl transition-all duration-200 text-2xl"
                  style={{ fontSize: '14px', fontWeight: 'normal' }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>Generate Animation</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            <FadeInOut show={loading}>
              <div className="mb-8 space-y-4">
                <ProcessStep
                  icon={Code2}
                  title="Creating the animation script"
                  description="Generating Manim Code..."
                  isActive={currentStep === 1}
                  isComplete={currentStep > 1}
                />
                {(currentStep === 1 || code) && (
                  <div className="px-4">
                    <Progress value={currentStep === 1 ? progress : 100} className="h-2" />
                  </div>
                )}

                <ProcessStep
                  icon={Video}
                  title="Rendering Animation"
                  description="Converting code into video..."
                  isActive={currentStep === 2}
                  isComplete={videoUrl !== null}
                />
                {currentStep === 2 && (
                  <div className="px-4">
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
            </FadeInOut>

            <FadeInOut show={!!videoUrl && !loading}>
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800 rounded-2xl overflow-hidden shadow-2xl mb-4">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-violet-400 mb-6">Your Animation is ready! 🎉</h3>
                  <div className="space-y-6">
                    <div className="rounded-xl overflow-hidden bg-gray-950 shadow-lg">
                      <video
                        ref={videoRef}
                        src={videoUrl ?? undefined}
                        className="w-full aspect-video object-cover"
                        controls
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (videoUrl) window.open(videoUrl, '_blank')
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl transition-all duration-200"
                    >
                      <Download className="mr-2 h-5 w-5" /> Download Animation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeInOut>

            <FadeInOut show={error !== null}>
              <Alert variant="destructive" className="mb-8 bg-red-950/50 border-red-900/50 text-red-300 rounded-xl backdrop-blur-xl">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="ml-2">{error}</AlertDescription>
              </Alert>
            </FadeInOut>
          </div>
        </div>
      </div>
    </div>
  )
}

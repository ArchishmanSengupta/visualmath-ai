"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ArrowRight, Code2, Download, Loader, Sparkles, Video } from "lucide-react"
import { useRef, useState } from "react"

const API_BASE_URL = "https://api.animo.video/v1"

// const examplePrompts = [
//   "Draw a red circle, then transform it into a right-angled triangle. Show the Pythagorean theorem explanation with detailed steps, including the derivation of the formula a^2 + b^2 = c^2. Illustrate each step with animations and equations.",
//   "Draw a blue square, then transform it into a rectangle. Show the area calculation for both shapes, including the formulas for area (A = side^2 for square and A = length * width for rectangle). Include detailed steps and animations for each calculation.",
//   "Create a green equilateral triangle, then morph it into an isosceles triangle. Explain the difference in their properties, including side lengths, angles, and area calculations. Show detailed steps and animations for each property comparison.",
// "Draw a yellow pentagon, then transform it into a hexagon. Show the interior angle calculations for both shapes, including the formulas (Interior Angle = (n-2) * 180 / n). Illustrate each step with animations and equations.",
// "Create a purple parallelogram, then morph it into a rhombus. Explain the properties of both shapes, including side lengths, angles, and area calculations. Show detailed steps and animations for each property comparison.",
// "Draw an orange trapezoid, then transform it into a kite. Show the area calculation for both shapes, including the formulas (Area = 1/2 * (base1 + base2) * height for trapezoid and Area = 1/2 * d1 * d2 for kite). Include detailed steps and animations for each calculation."
// ]

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

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0) // 0: not started, 1: generating code, 2: rendering video
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [code, setCode] = useState("")
  const [copied, setCopied] = useState(false)
  const videoRef = useRef(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
    }, step === 1 ? 100 : 100) // Faster for code generation, slower for video rendering
    return interval
  }

  const generateAnimation = async () => {
    setLoading(true)
    setCurrentStep(1)
    setError(null)
    setVideoUrl(null)
    
    const codeInterval = simulateProgress(1)

    try {
      const modifiedPrompt = "YOU ARE THE BEST MANIM CODER WITH 30 YRS OF EXPERIENCE. MAKE THE MANIM CODE LONGER AND DETAILED. DON'T ADD COMMENTS. ONLY RETURN WITH THE CODE, NO COMMENTARY FROM THIS USER QUERY: " + prompt;
      // Generate code
      const codeResponse = await fetch(`${API_BASE_URL}/code/generation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: modifiedPrompt, model: "gpt-4o" }),
      })

      if (!codeResponse.ok) {
        throw new Error("Failed to generate code. Please try again.")
      }

      clearInterval(codeInterval)
      setProgress(100)
      
      const codeData = await codeResponse.json()
      const pythonCode = codeData.code.replace(/```python|```/g, "").trim()
      setCode(pythonCode)

      // Short delay to show completion of code generation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Start video rendering
      setCurrentStep(2)
      setProgress(0)
      const videoInterval = simulateProgress(2)

      const renderResponse = await fetch(`${API_BASE_URL}/video/rendering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: pythonCode,
          file_name: "GenScene.py",
          file_class: "GenScene",
          iteration: 585337 + Math.floor(Math.random() * 1000),
          project_name: "GenScene",
        }),
      })

      if (!renderResponse.ok) {
        throw new Error("Failed to render video. Please try again.")
      }

      clearInterval(videoInterval)
      setProgress(100)

      const renderData = await renderResponse.json()
      setVideoUrl(renderData.video_url)

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <div className="absolute inset-0] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative">
        <div className="container mx-auto px-4 pt-12">
          {/* Header */}
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

          {/* Hero Section */}
          <div className="text-center mb-20">
            <h2 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500">
              English to Math Animations
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              powered by Manim Engine + gpt-4o.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {/* Example Prompts */}
            <div className="mb-8 flex flex-wrap gap-3 justify-center">
              {examplePrompts.map((examplePrompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 text-sm px-4 py-2 rounded-xl transition-all duration-200"
                  onClick={() => setPrompt(examplePrompt)}
                >
                  Sample {index + 1}
                </Button>
              ))}
            </div>

            {/* Input Card */}
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

            {/* Process Steps */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 space-y-4"
                >
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Video Output */}
            <AnimatePresence>
              {videoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
                    <CardContent className="p-8">
                        <h3 className="text-2xl font-semibold text-violet-400 mb-6">Your Animation is ready! 🎉</h3>
                      <div className="space-y-6">
                        <div className="rounded-xl overflow-hidden bg-gray-950 shadow-lg">
                          <video
                            ref={videoRef}
                            src={videoUrl}
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code Output */}
            {/* <AnimatePresence>
              {code && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800 mb-8 rounded-2xl overflow-hidden shadow-2xl">
                    <CardContent className="p-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-violet-400">Generated Manim Code</h3>
                        <Button
                          onClick={handleCopy}
                          variant="ghost"
                          className="hover:bg-gray-800/50 text-gray-400 hover:text-white"
                        >
                          {copied ? "Copied!" : <Clipboard className="h-5 w-5" />}
                        </Button>
                      </div>
                      <div className="bg-gray-950 rounded-xl p-6 overflow-x-auto">
                        <pre className="text-gray-300 font-mono text-sm">{code}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence> */}

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Alert variant="destructive" className="mb-8 bg-red-950/50 border-red-900/50 text-red-300 rounded-xl backdrop-blur-xl">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription className="ml-2">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
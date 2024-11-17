"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ArrowRight, Code2, Download, Loader, Sparkles, Video } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

const math_animation_prompts = {
  "rotating cube": "Create an animation of a red 3D cube rotating along its diagonal axis. Use a smooth rotation and ensure the cube is centered in the frame.",
  "sine wave": "Visualize a sine wave with amplitude 1 and frequency 2, smoothly oscillating over time. Use a continuous line to represent the wave.",
  "butterfly curve": "Animate a parametric butterfly curve being traced out in real-time, with changing colors. Ensure the curve is centered and the colors transition smoothly.",
  "surface plot": "Render a 3D surface plot of z = x² + y², with dynamic lighting and rotation. Make sure the surface is clearly visible and rotates slowly.",
  "fourier series": "Show the step-by-step buildup of a Fourier series approximating a square wave. Include intermediate steps and highlight the final approximation.",
  "lorenz attractor": "Animate the Lorenz attractor with particle trails illustrating chaotic behavior over time. Use smooth particle motion and ensure the attractor is clearly visible.",
  "mandelbrot zoom": "Zoom into the Mandelbrot set, dynamically transitioning through colorful iterations. Ensure the zoom is smooth and the colors are vibrant.",
  "expanding helix": "Create a 3D helix with a radius that expands and contracts in a smooth cycle. Ensure the helix is centered and the expansion is continuous.",
  "bezier curve": "Illustrate an animated Bezier curve, showing its control points and intermediate steps. Highlight the control points and the curve's formation.",
  "complex transform": "Visualize transformations of a complex function with real-time deformations in the plane. Ensure the transformations are smooth and clearly visible.",
  "vector fields": "Show animated vector fields with arrows smoothly transitioning based on varying inputs. Ensure the arrows are clearly visible and the transitions are smooth.",
  "parametric torus": "Animate a parametric torus in 3D, smoothly rotating and deforming its radii over time. Ensure the torus is centered and the deformations are continuous.",
  "fractal tree": "Illustrate the recursive growth of a fractal tree with animated branching patterns. Ensure the branches grow smoothly and the tree is centered.",
  "eigenvalues": "Visualize eigenvalues as dynamic geometric transformations in a 2D plane. Highlight the transformations and ensure they are clearly visible.",
  "taylor series": "Show an animated Taylor series approximation, converging to the function being approximated. Include intermediate steps and highlight the final approximation.",
  "spherical harmonics": "Render a 3D spherical harmonic function, oscillating between different harmonic modes. Ensure the oscillations are smooth and the function is clearly visible.",
  "lissajous curves": "Animate Lissajous curves, cycling through varying frequency ratios and phase shifts. Ensure the curves are smooth and the transitions are continuous.",
  "riemann zeta": "Visualize the Riemann zeta function with a dynamic representation of its zeros on the complex plane. Highlight the zeros and ensure the representation is clear.",
  "mobius strip": "Create an animated Mobius strip, twisting and rotating in 3D space. Ensure the strip is clearly visible and the rotation is smooth.",
  "hyperboloid": "Render a hyperboloid as a 3D plot, with its shape dynamically morphing. Ensure the morphing is smooth and the hyperboloid is centered.",
  "koch snowflake": "Animate the iterative construction of the Koch snowflake, step by step. Highlight each iteration and ensure the transitions are smooth.",
  "fibonacci spiral": "Visualize the Fibonacci sequence as a growing spiral with dynamic scaling. Ensure the spiral grows smoothly and is clearly visible.",
  "pythagorean proof": "Illustrate the proof of the Pythagorean theorem with animated square transformations. Highlight each transformation and ensure the proof is clear.",
  "klein bottle": "Render a 3D Klein bottle with a continuous rotation, highlighting its topology. Ensure the bottle is clearly visible and the rotation is smooth.",
  "pascal's triangle": "Show the development of Pascal's triangle, row by row, with color-coded values. Highlight each row and ensure the colors are distinct.",
  "prime numbers": "Visualize the distribution of prime numbers on a number line with animated highlights. Ensure the primes are clearly visible and the highlights are smooth.",
  "sierpinski triangle": "Animate the recursive formation of the Sierpinski triangle with a color-changing scheme. Highlight each iteration and ensure the colors transition smoothly.",
  "trefoil knot": "Render a 3D trefoil knot, smoothly twisting and rotating in 3D space. Ensure the knot is clearly visible and the rotation is smooth.",
  "logistic map": "Illustrate the logistic map with a dynamically evolving bifurcation diagram. Ensure the bifurcations are clearly visible and the evolution is smooth.",
  "golden ratio": "Visualize the golden ratio as it appears in successively growing rectangles and spirals. Ensure the growth is smooth and the ratio is clearly visible.",
  "cantor set": "Animate the construction of a Cantor set by repeatedly removing middle thirds. Highlight each removal and ensure the transitions are smooth.",
  "cardioid": "Render a cardioid shape traced by a rolling circle, dynamically illustrating its path. Ensure the tracing is smooth and the cardioid is clearly visible.",
  "apollonian gasket": "Animate the recursive generation of an Apollonian gasket with circles appearing step by step. Highlight each circle and ensure the transitions are smooth.",
  "modular arithmetic": "Visualize modular arithmetic as points rotating around a circle, connecting with chords. Ensure the rotations are smooth and the chords are clearly visible.",
  "peano curve": "Animate a Peano curve, showing its recursive filling of a square. Ensure the filling is smooth and the curve is clearly visible.",
  "lemniscate": "Render a 3D lemniscate shape, dynamically morphing as its parameters change. Ensure the morphing is smooth and the lemniscate is clearly visible.",
  "barnsley fern": "Illustrate the growth of a Barnsley fern fractal, building its structure over time. Ensure the growth is smooth and the fern is clearly visible.",
  "continued fractions": "Visualize continued fractions as a stepwise geometric unfolding process. Highlight each step and ensure the unfolding is smooth.",
  "hilbert curve": "Animate a Hilbert curve recursively filling a square, with smooth transitions between iterations. Ensure the filling is smooth and the curve is clearly visible."
};

const examplePrompts = Object.entries(math_animation_prompts)
  .map(([key, value]) => ({ key, value }))
  .sort(() => Math.random() - 0.5)
  .slice(0, 5);

const loadingMessages = [
    "Crafting mathematical beauty...",
    "Computing the visualization...",
    "Bringing math to life...",
    "Rendering your creation...",
    "Preparing your animation...",
    "Processing mathematical concepts..."
]

interface ProcessStepProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  isActive: boolean
  isComplete: boolean
}

const ProcessStep = ({ icon: Icon, title, description, isActive, isComplete }: ProcessStepProps) => (
  <div
    className={`relative flex flex-col items-center p-6 rounded-lg transition-all duration-500 ${
      isActive ? 'bg-violet-500/10 border border-violet-500/20 scale-110 animate-float' :
      isComplete ? 'bg-gray-800/20 border border-gray-700 scale-100' :
      'bg-gray-900/50 border border-gray-800 scale-95'
    }`}
  >
    <div
      className={`p-3 rounded-full transition-transform duration-300 ${
        isActive ? 'bg-violet-500 text-white animate-pulse' :
        isComplete ? 'bg-gray-700 text-gray-300' :
        'bg-gray-800 text-gray-500'
      }`}
    >
      <Icon className={`h-6 w-6 ${isActive ? 'animate-spin-slow' : ''}`} />
    </div>
    <div className="text-center mt-3">
      <h4
        className={`font-medium ${
          isActive ? 'text-violet-400' :
          isComplete ? 'text-gray-300' :
          'text-gray-500'
        }`}
      >
        {title}
      </h4>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  </div>
)

// Enhanced DottedLine Component
const DottedLine = ({ active, complete }: { active: boolean; complete: boolean }) => (
  <div className="h-px w-32 mx-4 relative overflow-hidden">
    <div className={`h-full w-full ${complete ? 'bg-violet-500' : 'bg-gray-700'}`}>
      {active && (
        <>
          <div className="absolute inset-0 animate-flow">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
          </div>
          <div className="absolute top-1/2 left-0 w-full">
            <div className="particle-trail" />
          </div>
        </>
      )}
    </div>
  </div>
)

const ProcessingSteps = ({ currentStep, progress }: { currentStep: number, progress: number }) => {
  return (
    <div className="flex flex-col items-center space-y-8 w-full">
      <div className="flex items-center justify-center w-full relative">
        {/* First Step */}
        <ProcessStep
          icon={Code2}
          title="Creating Script"
          description="Generating Animation Code"
          isActive={currentStep === 1}
          isComplete={currentStep > 1}
        />

        {/* Connecting Line with Particles */}
        <DottedLine
          active={currentStep === 1}
          complete={currentStep > 1}
        />

        {/* Second Step */}
        <ProcessStep
          icon={Video}
          title="Rendering"
          description="Creating Animation"
          isActive={currentStep === 2}
          isComplete={currentStep > 2}
        />
      </div>

      {/* Progress Bar */}
      <Progress
        value={progress}
        className="h-2 w-full max-w-md bg-gray-800/50"
      />

      <style jsx>{`
        @keyframes particle-flow {
          0% {
            transform: translateX(0) translateY(-4px) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateX(64px) translateY(-4px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(128px) translateY(-4px) scale(0);
            opacity: 0;
          }
        }

        @keyframes flow-line {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        .animate-flow-line {
          animation: flow-line 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0])
  const videoRef = useRef(null)

  useEffect(() => {
    let messageInterval: NodeJS.Timeout
    if (loading) {
      let messageIndex = 0
      messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length
        setLoadingMessage(loadingMessages[messageIndex])
      }, 10000)
    }
    return () => clearInterval(messageInterval)
  }, [loading])

  const simulateProgress = (step: number) => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 3
      })
    }, step === 1 ? 50 : 70)
    return interval
  }

  // Main generation function
  const generateAnimation = async () => {
    setLoading(true);
    setCurrentStep(1);
    setError(null);
    setVideoUrl(null);
  
    const codeInterval = simulateProgress(1);
  
    try {
      // Prepare the prompt
      const firstPrompt =
        "Generate detailed and extensive Manim code based on the following user query. Do not include any comments or explanations in the code. User query: ";
      const modifiedPrompt = firstPrompt + prompt;
  
      // First API call to generate code
      const codeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/code/generation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: modifiedPrompt, model: 'gpt-4o' }),
      });
  
      if (!codeResponse.ok) {
        throw new Error('Failed to generate code. Please try again.');
      }
  
      clearInterval(codeInterval);
      setProgress(100);
  
      const codeData = await codeResponse.json();
      const pythonCode = codeData.code.replace(/```python|```/g, '').trim();
  
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay for UX
  
      setCurrentStep(2);
      setProgress(0);
      const videoInterval = simulateProgress(2);
  
      // Second API call to render video
      const renderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video/rendering`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: pythonCode,
          file_name: 'GenScene.py',
          file_class: 'GenScene',
          iteration: 585337 + Math.floor(Math.random() * 1000),
          project_name: 'GenScene',
        }),
      });
  
      if (!renderResponse.ok) {
        throw new Error('Failed to render video. Please try again.');
      }
  
      const renderData = await renderResponse.json();
  
      if (!renderData.video_url) {
        throw new Error('No video URL received from the server.');
      }
  
      clearInterval(videoInterval);
      setProgress(100);
      setVideoUrl(renderData.video_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-black text-white font-inter relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-black to-indigo-900/20 animate-gradient-shift" />

      <div className="relative">
        <div className="max-w-6xl mx-auto px-4 pt-12">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                <Sparkles className="h-6 w-6 text-white animate-sparkle" />
              </div>
              <h1 className="text-2xl font-semibold group-hover:text-violet-400 transition-colors">
                visualmath-ai
              </h1>
            </div>
            <Button
              variant="ghost"
              className="text-white font-bold hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-300"
              onClick={() => window.open('https://x.com/archiexzzz', '_blank')}
            >
              @archiexzzz
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-20">
            <h2 className="text-6xl font-bold mb-6 animate-gradient-text">
              English to Math Animations
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto animate-fade-in">
              powered by manim engine + gpt-4o
            </p>
          </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto">
            {/* Example Prompts */}
            <div className="mb-8 flex flex-wrap gap-3 justify-center">
              {examplePrompts.map((examplePrompt, index) => (
              <Button
                key={index}
                variant="ghost"
                className="bg-gray-900/50 hover:bg-gray-800/50 hover:text-white border border-gray-800 text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                onClick={() => setPrompt(examplePrompt.value)}
              >
                {examplePrompt.key}
              </Button>
              ))}
            </div>

            {/* Input Card */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800 mb-8 rounded-2xl overflow-hidden shadow-2xl hover:border-violet-500/50 transition-all duration-300">
              <CardContent className="p-8">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the mathematical concept you want to visualize..."
                className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 mb-6 p-4 rounded-xl min-h-[120px] resize-none focus:ring-2 focus:ring-violet-500 transition-all duration-200 text-lg"
                disabled={loading}
              />
              <Button
                onClick={generateAnimation}
                disabled={loading || !prompt}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-6 rounded-xl transition-all duration-200 text-lg font-medium hover:scale-[1.02]"
              >
                {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>{loadingMessage}</span>
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

            {/* Processing Steps */}
            {loading && (
              <div className="flex flex-col items-center space-y-8 mb-16 animate-fadeIn">
                <ProcessingSteps
                  currentStep={currentStep}
                  progress={progress}
                />
              </div>
            )}
            {videoUrl && !loading && (
              <div className="animate-fadeIn">
                <Card className="bg-gray-900/70 backdrop-blur-lg border-gray-700 rounded-3xl overflow-hidden shadow-2xl mb-12 p-4 max-w-lg mx-auto">
                  <CardContent className="text-center space-y-8">
                    <h3 className="text-2xl font-bold text-gradient bg-clip-text text-white from-violet-400 via-indigo-500 to-pink-500">
                      Your Animation is ready! 🎉
                    </h3>
                    <div className="space-y-8">
                      <div className="rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 p-1">
                        <div className="rounded-xl bg-gray-950">
                          <video
                            ref={videoRef}
                            src={videoUrl}
                            className="w-full aspect-video object-cover rounded-xl shadow-lg"
                            controls
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (videoUrl) window.open(videoUrl, '_blank');
                        }}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-4 px-8 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                      >
                        <Download className="mr-3 h-6 w-6" />
                        Download Animation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}


            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-8 bg-red-950/50 border-red-900/50 text-red-300 rounded-xl backdrop-blur-xl">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="ml-2">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1.1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }

        @keyframes gradient-text {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes particle {
          0% {
            transform: translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateX(200%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(400%) scale(0);
            opacity: 0;
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 10s ease infinite;
        }

        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }

        .animate-float {
          animation: float 2.5s ease-in-out infinite;
        }

        .animate-gradient-text {
          background: linear-gradient(90deg, #A855F7, #6366F1, #A855F7);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: gradient-text 4s ease infinite;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-flow {
          animation: flow 1.5s linear infinite;
        }

        .particle-trail {
          position: relative;
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #A855F7, transparent);
          animation: particle 1.5s linear infinite;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

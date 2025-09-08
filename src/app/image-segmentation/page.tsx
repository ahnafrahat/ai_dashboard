"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Brain, 
  Upload, 
  Scissors, 
  Image as ImageIcon,
  Sliders,
  ArrowLeft,
  Download,
  Eye,
  Edit3,
  Check,
  X
} from "lucide-react"
import Link from "next/link"

interface DetectedObject {
  id: string
  bbox: [number, number, number, number] // [x, y, width, height]
  description: string
  confidence: number
  croppedImageUrl?: string
}

interface SegmentationResponse {
  success: boolean
  message: string
  results: Array<{
    bbox: [number, number, number, number]
    description: string
    confidence: string
  }>
  raw_output: string
  debug_info: {
    text_length: number
    text_preview: string
  }
}

export default function ImageSegmentationPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("Segment the main objects")
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([])
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null)
  const [editingDescription, setEditingDescription] = useState<string | null>(null)
  const [tempDescription, setTempDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:image/...;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const createCroppedImageUrl = (imageUrl: string, bbox: [number, number, number, number]): Promise<string> => {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const [x, y, width, height] = bbox
        canvas.width = width
        canvas.height = height
        
        if (ctx) {
          ctx.drawImage(img, x, y, width, height, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg'))
        }
      }
      img.src = imageUrl
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
      setDetectedObjects([])
      setSelectedObject(null)
      setError(null)
    }
  }

  const handleSegmentation = async () => {
    if (!selectedImage || !imagePreview) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Convert image to base64
      const imageBase64 = await convertImageToBase64(selectedImage)
      
      // Call the segmentation API through Next.js API route
      const response = await fetch('/api/segmentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          prompt: prompt,
          model: "qwen-vl-plus",
          temperature: 0.0,
          top_k: 1,
          seed: 3407,
          mime_type: selectedImage.type || "image/jpeg"
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `API request failed: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data: SegmentationResponse = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Segmentation failed')
      }

      // Process the results and create cropped images
      const processedObjects: DetectedObject[] = await Promise.all(
        data.results.map(async (result, index) => {
          const croppedImageUrl = await createCroppedImageUrl(imagePreview, result.bbox)
          return {
            id: `object-${index}`,
            bbox: result.bbox,
            description: result.description,
            confidence: parseFloat(result.confidence),
            croppedImageUrl
          }
        })
      )

      setDetectedObjects(processedObjects)
    } catch (err) {
      console.error('Segmentation error:', err)
      let errorMessage = 'An error occurred during segmentation'
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the segmentation service. Please ensure the backend service is running on port 8000.'
        } else if (err.message.includes('Backend service error')) {
          errorMessage = err.message
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleObjectSelect = (object: DetectedObject) => {
    setSelectedObject(object)
  }

  const downloadCroppedImage = (object: DetectedObject) => {
    if (!object.croppedImageUrl) return
    
    const link = document.createElement('a')
    link.href = object.croppedImageUrl
    link.download = `segmented_object_${object.id}_${Math.round(object.confidence * 100)}%.jpg`
    link.click()
  }

  const startEditingDescription = (objectId: string, currentDescription: string) => {
    setEditingDescription(objectId)
    setTempDescription(currentDescription)
  }

  const saveDescription = (objectId: string) => {
    setDetectedObjects(prev => 
      prev.map(obj => 
        obj.id === objectId 
          ? { ...obj, description: tempDescription }
          : obj
      )
    )
    if (selectedObject?.id === objectId) {
      setSelectedObject(prev => 
        prev ? { ...prev, description: tempDescription } : null
      )
    }
    setEditingDescription(null)
    setTempDescription("")
  }

  const cancelEditingDescription = () => {
    setEditingDescription(null)
    setTempDescription("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-4 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Link>
              <Brain className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Image Segmentation</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>MA</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Image Upload and Settings */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Upload an image to detect and segment objects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="Selected"
                          className="mx-auto max-h-48 rounded-lg"
                        />
                        <p className="text-sm text-gray-600">{selectedImage?.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
                
                <Button 
                  onClick={handleSegmentation} 
                  disabled={!selectedImage || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Scissors className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Scissors className="h-4 w-4 mr-2" />
                      Detect Objects
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Segmentation Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Segmentation Settings
                </CardTitle>
                <CardDescription>
                  Configure the segmentation prompt and parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-medium">
                    Segmentation Prompt
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    placeholder="Enter your segmentation prompt..."
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>• Describe what you want to segment in the image</p>
                  <p>• Be specific about the object or area of interest</p>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="h-4 w-4" />
                    <span className="font-medium">Error:</span>
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detection Results Summary */}
            {detectedObjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Segmentation Summary
                  </CardTitle>
                  <CardDescription>
                    Overview of segmented objects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Objects:</span>
                      <Badge variant="secondary">{detectedObjects.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Confidence:</span>
                      <Badge variant="outline">
                        {Math.round((detectedObjects.reduce((sum, obj) => sum + obj.confidence, 0) / detectedObjects.length) * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Highest Confidence:</span>
                      <Badge variant="default">
                        {Math.round(Math.max(...detectedObjects.map(obj => obj.confidence)) * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant="default">Segmentation Complete</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Detected Objects and Cropped Images */}
          <div className="space-y-6">
            {/* Selected Object Details - Moved to top */}
            {selectedObject && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Selected Object Details
                  </CardTitle>
                  <CardDescription>
                    Detailed information about the selected object
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      {selectedObject.croppedImageUrl && (
                        <img
                          src={selectedObject.croppedImageUrl}
                          alt={`Detailed object ${selectedObject.id}`}
                          className="mx-auto max-h-48 rounded-lg shadow-md"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Confidence:</span>
                        <Badge variant="secondary">
                          {Math.round(selectedObject.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Bounding Box:</span>
                        <span className="text-gray-600 text-sm">
                          X: {selectedObject.bbox[0]}, Y: {selectedObject.bbox[1]}, 
                          W: {selectedObject.bbox[2]}, H: {selectedObject.bbox[3]}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <span className="font-medium">Description:</span>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">
                          {selectedObject.description}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => downloadCroppedImage(selectedObject)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Cropped Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detected Objects Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Detected Objects
                </CardTitle>
                <CardDescription>
                  {detectedObjects.length > 0 
                    ? `Found ${detectedObjects.length} segmented objects` 
                    : "Upload an image and configure settings to segment objects"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {detectedObjects.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {detectedObjects.map((object) => (
                      <div 
                        key={object.id} 
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedObject?.id === object.id 
                            ? 'border-purple-500 bg-purple-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleObjectSelect(object)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">Object {object.id.split('-')[1]}</h3>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditingDescription(object.id, object.description)
                                }}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadCroppedImage(object)
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="relative">
                            {object.croppedImageUrl && (
                              <img
                                src={object.croppedImageUrl}
                                alt={`Cropped object ${object.id}`}
                                className="w-full h-24 object-cover rounded-md"
                              />
                            )}
                            <div className="absolute top-1 right-1">
                              <Badge variant="secondary" className="text-xs bg-white/90 text-black">
                                {Math.round(object.confidence * 100)}%
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {editingDescription === object.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={tempDescription}
                                  onChange={(e) => setTempDescription(e.target.value)}
                                  className="w-full text-xs p-2 border rounded-md resize-none"
                                  rows={3}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      saveDescription(object.id)
                                    }}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      cancelEditingDescription()
                                    }}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                                {object.description}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            BBox: [{object.bbox.join(', ')}]
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Scissors className="mx-auto h-12 w-12 mb-4" />
                    <p>No objects detected</p>
                    <p className="text-sm">Upload an image to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

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
  Eye
} from "lucide-react"
import Link from "next/link"

interface DetectedObject {
  id: string
  label: string
  confidence: number
  bbox: [number, number, number, number] // [x, y, width, height]
  croppedImageUrl: string
}

export default function ImageSegmentationPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([])
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
      setDetectedObjects([])
      setSelectedObject(null)
    }
  }

  const handleSegmentation = async () => {
    if (!selectedImage) return
    
    setIsProcessing(true)
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock detected objects data
      const mockObjects: DetectedObject[] = [
        {
          id: "1",
          label: "Person",
          confidence: 0.95,
          bbox: [120, 80, 200, 300],
          croppedImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop"
        },
        {
          id: "2",
          label: "Car",
          confidence: 0.87,
          bbox: [350, 200, 250, 150],
          croppedImageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=250&h=150&fit=crop"
        },
        {
          id: "3",
          label: "Building",
          confidence: 0.82,
          bbox: [50, 50, 400, 200],
          croppedImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop"
        },
        {
          id: "4",
          label: "Tree",
          confidence: 0.78,
          bbox: [500, 100, 150, 250],
          croppedImageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=150&h=250&fit=crop"
        },
        {
          id: "5",
          label: "Sign",
          confidence: 0.75,
          bbox: [200, 350, 100, 80],
          croppedImageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=80&fit=crop"
        }
      ].filter(obj => obj.confidence >= confidenceThreshold)

      setDetectedObjects(mockObjects)
      setIsProcessing(false)
    }, 3000)
  }

  const handleObjectSelect = (object: DetectedObject) => {
    setSelectedObject(object)
  }

  const downloadCroppedImage = (object: DetectedObject) => {
    const link = document.createElement('a')
    link.href = object.croppedImageUrl
    link.download = `${object.label}_${Math.round(object.confidence * 100)}%.jpg`
    link.click()
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

            {/* Confidence Threshold */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Detection Settings
                </CardTitle>
                <CardDescription>
                  Adjust the confidence threshold for object detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Confidence Threshold</span>
                    <span className="font-medium">{Math.round(confidenceThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>• Higher threshold = Fewer but more confident detections</p>
                  <p>• Lower threshold = More detections but less confident</p>
                </div>
              </CardContent>
            </Card>

            {/* Detection Results Summary */}
            {detectedObjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Detection Summary
                  </CardTitle>
                  <CardDescription>
                    Overview of detected objects
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
                      <img
                        src={selectedObject.croppedImageUrl}
                        alt={`Detailed ${selectedObject.label}`}
                        className="mx-auto max-h-48 rounded-lg shadow-md"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Label:</span>
                        <span className="text-gray-600">{selectedObject.label}</span>
                      </div>
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
                    ? `Found ${detectedObjects.length} objects above ${Math.round(confidenceThreshold * 100)}% confidence` 
                    : "Upload an image and adjust settings to detect objects"
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
                            <h3 className="font-medium text-sm">{object.label}</h3>
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
                          
                          <div className="relative">
                            <img
                              src={object.croppedImageUrl}
                              alt={`Cropped ${object.label}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <div className="absolute top-1 right-1">
                              <Badge variant="secondary" className="text-xs bg-white/90 text-black">
                                {Math.round(object.confidence * 100)}%
                              </Badge>
                            </div>
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

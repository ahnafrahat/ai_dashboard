"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Brain, 
  Upload, 
  Search, 
  Settings,
  Image as ImageIcon,
  Sliders,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function ImageSimilarityPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8)
  const [isSearching, setIsSearching] = useState(false)
  const [similarImages, setSimilarImages] = useState<Array<{
    id: string
    url: string
    similarity: number
    tags: string[]
  }>>([])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleSearch = async () => {
    if (!selectedImage) return
    
    setIsSearching(true)
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock similar images data
      setSimilarImages([
        {
          id: "1",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
          similarity: 0.95,
          tags: ["nature", "landscape", "mountain"]
        },
        {
          id: "2",
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
          similarity: 0.87,
          tags: ["forest", "trees", "green"]
        },
        {
          id: "3",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
          similarity: 0.82,
          tags: ["outdoor", "scenery", "panorama"]
        },
        {
          id: "4",
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
          similarity: 0.78,
          tags: ["wilderness", "adventure", "exploration"]
        },
        {
          id: "5",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
          similarity: 0.75,
          tags: ["travel", "photography", "nature"]
        },
        {
          id: "6",
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
          similarity: 0.72,
          tags: ["outdoor", "landscape", "beauty"]
        }
      ])
      setIsSearching(false)
    }, 2000)
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
              <h1 className="text-2xl font-bold text-gray-900">Image Similarity Search</h1>
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
                  Upload an image to find similar images in your database
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
                    {selectedImage ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Selected"
                          className="mx-auto max-h-48 rounded-lg"
                        />
                        <p className="text-sm text-gray-600">{selectedImage.name}</p>
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
                  onClick={handleSearch} 
                  disabled={!selectedImage || isSearching}
                  className="w-full"
                >
                  {isSearching ? (
                    <>
                      <Search className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Find Similar Images
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
                  Search Settings
                </CardTitle>
                <CardDescription>
                  Adjust the confidence threshold for image similarity
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
                  <p>• Higher threshold = More similar results</p>
                  <p>• Lower threshold = More diverse results</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Similar Images Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Similar Images
                </CardTitle>
                <CardDescription>
                  {similarImages.length > 0 
                    ? `Found ${similarImages.length} similar images` 
                    : "Upload an image and adjust settings to find similar images"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {similarImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {similarImages.map((image) => (
                      <div key={image.id} className="space-y-2">
                        <div className="relative group">
                          <img
                            src={image.url}
                            alt="Similar image"
                            className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-black">
                              {Math.round(image.similarity * 100)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {image.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                    <p>No images to display</p>
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


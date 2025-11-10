"use client"

import { useEffect, useState } from "react"
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

// Types for the API
interface SimilarityResult {
  id: string
  score: number
  payload: {
    description: string
    url: string
    objectImageUrl: string
    createdAt: string
    updatedAt: string
  }
}

interface SimilaritySearchResponse {
  success: boolean
  message: string
  model_used: string
  query_embedding_size: number
  results: SimilarityResult[]
  search_params: {
    limit: number
    score_threshold: number | null
  }
}

export default function ImageSimilarityPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6)
  const [isSearching, setIsSearching] = useState(false)
  const [similarImages, setSimilarImages] = useState<SimilarityResult[]>([])
  const [selectedModel, setSelectedModel] = useState<'v2' | 'v3'>('v2')
  const [searchLimit, setSearchLimit] = useState(15)
  const [searchResults, setSearchResults] = useState<SimilaritySearchResponse | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setSelectedImageDataUrl(null)
    }
  }

  const handleSearch = async () => {
    if (!selectedImage && !selectedImageDataUrl) return
    
    setIsSearching(true)
    setSearchResults(null)
    
    try {
      // Convert image to base64
      let imageBase64: string
      
      if (selectedImage) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            // Remove data:image/...;base64, prefix
            const base64 = result.split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(selectedImage)
        })
      } else if (selectedImageDataUrl) {
        // Remove data:image/...;base64, prefix
        imageBase64 = selectedImageDataUrl.split(',')[1]
      } else {
        throw new Error('No image selected')
      }

      // Call the API
      const response = await fetch('http://localhost:8000/image-similarity-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          model: selectedModel,
          limit: searchLimit,
          score_threshold: confidenceThreshold
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: SimilaritySearchResponse = await response.json()
      
      if (data.success) {
        setSearchResults(data)
        setSimilarImages(data.results)
      } else {
        throw new Error(data.message || 'Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSimilarImages([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('similarity:selectedImage')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.imageDataUrl) {
        setSelectedImageDataUrl(parsed.imageDataUrl as string)
      }
      if (parsed?.uploadedUrl) {
        setUploadedImageUrl(parsed.uploadedUrl as string)
      }
    } catch (e) {
      // noop
    }
  }, [])

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
                    {selectedImage || selectedImageDataUrl ? (
                      <div className="space-y-2">
                        <img
                          src={selectedImage ? URL.createObjectURL(selectedImage) : (selectedImageDataUrl as string)}
                          alt="Selected"
                          className="mx-auto max-h-48 rounded-lg"
                        />
                        <p className="text-sm text-gray-600">{selectedImage ? selectedImage.name : 'Image from segmentation'}</p>
                        {uploadedImageUrl && (
                          <p className="text-xs text-green-700 break-all">Uploaded URL: {uploadedImageUrl}</p>
                        )}
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
                  disabled={(!selectedImage && !selectedImageDataUrl) || isSearching}
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

            {/* Search Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Search Settings
                </CardTitle>
                <CardDescription>
                  Configure the image similarity search parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model Version</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="v2"
                        checked={selectedModel === 'v2'}
                        onChange={(e) => setSelectedModel(e.target.value as 'v2' | 'v3')}
                        className="text-purple-600"
                      />
                      <span className="text-sm">V2</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="v3"
                        checked={selectedModel === 'v3'}
                        onChange={(e) => setSelectedModel(e.target.value as 'v2' | 'v3')}
                        className="text-purple-600"
                      />
                      <span className="text-sm">V3</span>
                    </label>
                  </div>
                </div>

                {/* Search Limit */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Search Limit</span>
                    <span className="font-medium">{searchLimit}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Score Threshold */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score Threshold</span>
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
                  {searchResults ? (
                    <div className="space-y-1">
                      <p>{searchResults.message}</p>
                      <p className="text-xs text-gray-500">
                        Model: {searchResults.model_used} | 
                        Embedding Size: {searchResults.query_embedding_size} | 
                        Results: {searchResults.results.length}
                      </p>
                    </div>
                  ) : similarImages.length > 0 ? (
                    `Found ${similarImages.length} similar images`
                  ) : (
                    "Upload an image and adjust settings to find similar images"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {similarImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {similarImages.map((image) => (
                      <div key={image.id} className="space-y-2">
                        <div className="relative group">
                          <img
                            src={image.payload.url || image.payload.objectImageUrl}
                            alt={image.payload.description || "Similar image"}
                            className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              // Fallback to objectImageUrl if url fails
                              const target = e.target as HTMLImageElement
                              if (target.src !== image.payload.objectImageUrl) {
                                target.src = image.payload.objectImageUrl
                              }
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-black">
                              {Math.round(image.score * 100)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {image.payload.description || 'No description'}
                          </p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>ID: {image.id.slice(0, 8)}...</span>
                            <span>{new Date(image.payload.createdAt).toLocaleDateString()}</span>
                          </div>
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





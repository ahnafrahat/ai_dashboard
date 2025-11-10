"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Brain, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  Eye,
  Download,
  MoreHorizontal,
  X,
  Plus,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

// Types matching the API documentation
interface ImagePayload {
  description: string
  url: string
  objectImageUrl: string
  createdAt: string
  updatedAt: string
}

interface GalleryImage {
  id: string
  score?: number // Only present in search results
  payload: ImagePayload
}

interface PaginationInfo {
  page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

interface SearchInfo {
  model_used: string
  query_embedding_size: number
  search_params: {
    limit: number
    score_threshold: number | null
  }
}

interface GalleryResponse {
  success: boolean
  message: string
  data: GalleryImage[]
  pagination?: PaginationInfo
  search_info?: SearchInfo
}

interface SearchFilters {
  tags: string[]
  dateRange: {
    start: string
    end: string
  }
  sizeRange: {
    min: number
    max: number
  }
  model?: string
}

export default function ImageGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState<SearchFilters>({
    tags: [],
    dateRange: { start: '', end: '' },
    sizeRange: { min: 0, max: 10000000 },
    model: undefined
  })
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  
  // Search mode state
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchImage, setSearchImage] = useState<File | null>(null)
  const [searchImagePreview, setSearchImagePreview] = useState<string | null>(null)
  const [searchModel, setSearchModel] = useState<'v2' | 'v3'>('v2')
  const [searchLimit, setSearchLimit] = useState(10)
  const [scoreThreshold, setScoreThreshold] = useState(0.5)
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  // TEMP: demo tags list if not provided elsewhere
  const allTags = [
    'people', 'nature', 'product', 'city', 'animal', 'food', 'fashion', 'abstract', 'technology', 'art'
  ]

  // API functions
  const loadGalleryImages = async (page: number = 1, size: number = 20) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/image-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page,
          page_size: size
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: GalleryResponse = await response.json()
      
      if (data.success) {
        setImages(data.data)
        setFilteredImages(data.data)
        setPagination(data.pagination || null)
        setIsSearchMode(false)
        setSearchInfo(null)
      } else {
        throw new Error(data.message || 'Failed to load images')
      }
    } catch (err) {
      console.error('Error loading gallery images:', err)
      setError(err instanceof Error ? err.message : 'Failed to load images')
      setImages([])
      setFilteredImages([])
    } finally {
      setIsLoading(false)
    }
  }

  const searchSimilarImages = async () => {
    if (!searchImage) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Convert image to base64
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Remove data:image/...;base64, prefix
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(searchImage)
      })

      const response = await fetch('/api/image-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          image: imageBase64,
          model: searchModel,
          limit: searchLimit,
          score_threshold: scoreThreshold
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: GalleryResponse = await response.json()
      
      if (data.success) {
        setImages(data.data)
        setFilteredImages(data.data)
        setSearchInfo(data.search_info || null)
        setIsSearchMode(true)
        setPagination(null)
      } else {
        throw new Error(data.message || 'Search failed')
      }
    } catch (err) {
      console.error('Error searching similar images:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setImages([])
      setFilteredImages([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load images on component mount
  useEffect(() => {
    loadGalleryImages(currentPage, pageSize)
  }, [currentPage, pageSize])

  // Filter images based on search query and filters (only for gallery mode)
  useEffect(() => {
    if (isSearchMode) {
      // In search mode, don't apply client-side filtering
      setFilteredImages(images)
      return
    }

    let filtered = images

    // Search by description
    if (searchQuery) {
      filtered = filtered.filter(image => 
        image.payload.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by date range
    if (filters.dateRange.start) {
      filtered = filtered.filter(image => 
        new Date(image.payload.createdAt) >= new Date(filters.dateRange.start)
      )
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(image => 
        new Date(image.payload.createdAt) <= new Date(filters.dateRange.end)
      )
    }

    setFilteredImages(filtered)
  }, [images, searchQuery, filters, isSearchMode])

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image)
    setShowImageModal(true)
  }

  const handleSearchImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSearchImage(file)
      setSearchImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSearch = () => {
    if (searchImage) {
      searchSimilarImages()
    } else {
      // Text search in gallery mode
      loadGalleryImages(currentPage, pageSize)
    }
  }

  const handleUpload = () => {
    // TODO: Implement image upload functionality
    console.log("Upload new image")
  }

  const handleBackToGallery = () => {
    setIsSearchMode(false)
    setSearchImage(null)
    setSearchImagePreview(null)
    setSearchInfo(null)
    loadGalleryImages(currentPage, pageSize)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
              <h1 className="text-2xl font-bold text-gray-900">Image Gallery</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>IG</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  {isSearchMode ? 'Similarity Search' : 'Search Images'}
                </CardTitle>
                <CardDescription>
                  {isSearchMode 
                    ? 'Upload an image to find similar images using AI'
                    : 'Find images by description or other criteria'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isSearchMode ? (
                  <>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={handleBackToGallery}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Gallery
                      </Button>
                      <div className="text-sm text-gray-600">
                        Upload an image to find similar images
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSearchImageUpload}
                        className="hidden"
                        id="search-image-upload"
                      />
                      <label htmlFor="search-image-upload" className="cursor-pointer">
                        {searchImagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={searchImagePreview}
                              alt="Search image"
                              className="mx-auto max-h-32 rounded-lg"
                            />
                            <p className="text-sm text-gray-600">{searchImage?.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Click to upload search image
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Search Settings */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Model</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="v2"
                              checked={searchModel === 'v2'}
                              onChange={(e) => setSearchModel(e.target.value as 'v2' | 'v3')}
                              className="text-purple-600"
                            />
                            <span className="text-sm">DINOv2</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="v3"
                              checked={searchModel === 'v3'}
                              onChange={(e) => setSearchModel(e.target.value as 'v2' | 'v3')}
                              className="text-purple-600"
                            />
                            <span className="text-sm">DINOv3</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Search Limit</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={searchLimit}
                          onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Score Threshold</label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={scoreThreshold}
                          onChange={(e) => setScoreThreshold(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-center">
                          {Math.round(scoreThreshold * 100)}%
                        </div>
                      </div>

                      <Button 
                        onClick={handleSearch} 
                        disabled={!searchImage || isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
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
                    </div>
                  </>
                ) : (
                  <>
                    {/* Text Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search images by description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setIsSearchMode(true)} 
                        className="flex items-center gap-2 w-full"
                      >
                        <Search className="h-4 w-4" />
                        Similarity Search
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            {!isSearchMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <CardDescription>Refine results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Tags Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {allTags.slice(0, 12).map(tag => (
                          <button
                            key={tag}
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                tags: prev.tags.includes(tag)
                                  ? prev.tags.filter(t => t !== tag)
                                  : [...prev.tags, tag]
                              }))
                            }}
                            className={`px-2 py-1 text-xs rounded-full border ${
                              filters.tags.includes(tag)
                                ? 'bg-purple-100 border-purple-300 text-purple-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Date Range</label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, start: e.target.value }
                          }))}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md"
                        />
                        <input
                          type="date"
                          value={filters.dateRange.end}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, end: e.target.value }
                          }))}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    {/* Model Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Model</label>
                      <select
                        value={filters.model || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          model: e.target.value || undefined
                        }))}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="">All Models</option>
                        <option value="v2">V2</option>
                        <option value="v3">V3</option>
                      </select>
                    </div>

                    {/* Size Range */}
                    <div>
                      <label className="block text-sm font-medium mb-2">File Size (MB)</label>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={filters.sizeRange.max / 1000000}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            sizeRange: { ...prev.sizeRange, max: parseFloat(e.target.value) * 1000000 }
                          }))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-600 text-center">
                          Max: {Math.round(filters.sizeRange.max / 1000000)}MB
                        </div>
                      </div>
                    </div>

                    {/* View Controls */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">View</label>
                      <div className="flex border border-gray-300 rounded-md overflow-hidden">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="flex-1 rounded-none"
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="flex-1 rounded-none"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Upload */}
                    {/* <Button onClick={handleUpload} className="w-full flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Upload Images
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main content area */}
          <section className="lg:col-span-8 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="mb-0">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-red-600">
                      <X className="h-4 w-4" />
                      <span className="font-medium">Error:</span>
                      <span>{error}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Results Summary */}
            <div className="mb-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">
                    {isLoading ? 'Loading...' : `${filteredImages.length} images found`}
                  </h2>
                  {selectedImages.length > 0 && (
                    <Badge variant="secondary">
                      {selectedImages.length} selected
                    </Badge>
                  )}
                  {isSearchMode && searchInfo && (
                    <Badge variant="outline">
                      Model: {searchInfo.model_used} | Embedding: {searchInfo.query_embedding_size}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedImages.length > 0 && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Selected
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => loadGalleryImages(currentPage, pageSize)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              {/* Pagination Info */}
              {pagination && !isSearchMode && (
                <div className="mt-2 text-sm text-gray-600">
                  Page {pagination.page} of {pagination.total_pages} • 
                  {pagination.total_items} total images • 
                  {pagination.page_size} per page
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredImages.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4"
                  : "space-y-4"
              }>
                {filteredImages.map((image) => (
                  <Card 
                    key={image.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedImages.includes(image.id) ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => handleImageClick(image)}
                  >
                    <CardContent className="p-0">
                      {viewMode === 'grid' ? (
                        <div className="relative group">
                            <img
                              src={image.payload.url || image.payload.objectImageUrl}
                              alt={image.payload.description}
                              className="w-full h-48 object-cover rounded-t-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = image.payload.objectImageUrl
                              }}
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleImageSelect(image.id)
                                }}
                              >
                                {selectedImages.includes(image.id) ? '✓' : '+'}
                              </Button>
                            </div>
                            {image.score && (
                              <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="bg-white/90 text-black">
                                  {Math.round(image.score * 100)}%
                                </Badge>
                              </div>
                            )}
                            <div className="p-3">
                              <p className="text-sm font-medium line-clamp-2 mb-2">{image.payload.description}</p>
                              <div className="text-xs text-gray-500">
                                {formatDate(image.payload.createdAt)}
                              </div>
                            </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4 p-4">
                          <img
                            src={image.payload.url || image.payload.objectImageUrl}
                            alt={image.payload.description}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = image.payload.objectImageUrl
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{image.payload.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(image.payload.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {image.score && (
                              <Badge variant="secondary">
                                {Math.round(image.score * 100)}%
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImageSelect(image.id)
                              }}
                            >
                              {selectedImages.includes(image.id) ? '✓' : '+'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || filters.tags.length > 0 || filters.dateRange.start || filters.dateRange.end
                      ? "Try adjusting your search criteria or filters"
                      : "Upload some images to get started"
                    }
                  </p>
                  <Button onClick={handleUpload}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination Controls */}
            {pagination && !isSearchMode && pagination.total_pages > 1 && (
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.has_prev}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(pagination.total_pages - 4, currentPage - 2)) + i
                      if (pageNum > pagination.total_pages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.has_next}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Image Modal */}
            {showImageModal && selectedImage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowImageModal(false)} />
                <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{selectedImage.payload.description}</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowImageModal(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <img
                          src={selectedImage.payload.url || selectedImage.payload.objectImageUrl}
                          alt={selectedImage.payload.description}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Description</h3>
                          <p className="text-gray-600">{selectedImage.payload.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium mb-1">Image ID</h3>
                            <p className="text-sm text-gray-600 font-mono">{selectedImage.id}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Created</h3>
                            <p className="text-sm text-gray-600">{formatDate(selectedImage.payload.createdAt)}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Updated</h3>
                            <p className="text-sm text-gray-600">{formatDate(selectedImage.payload.updatedAt)}</p>
                          </div>
                          {selectedImage.score && (
                            <div>
                              <h3 className="font-medium mb-1">Similarity Score</h3>
                              <p className="text-sm text-gray-600">
                                {Math.round(selectedImage.score * 100)}%
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium">Image URLs</h3>
                          <div className="space-y-1">
                            <div>
                              <span className="text-xs text-gray-500">Original:</span>
                              <p className="text-xs text-blue-600 break-all">{selectedImage.payload.url}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Object:</span>
                              <p className="text-xs text-blue-600 break-all">{selectedImage.payload.objectImageUrl}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Search className="h-4 w-4 mr-2" />
                            Find Similar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

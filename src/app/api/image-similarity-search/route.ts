import { NextRequest, NextResponse } from 'next/server'

// Types for the API request and response
interface SimilaritySearchRequest {
  image: string // Base64 encoded image
  model: 'v2' | 'v3'
  limit: number
  score_threshold: number
}

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

export async function POST(request: NextRequest) {
  try {
    const body: SimilaritySearchRequest = await request.json()
    
    // Validate required fields
    if (!body.image || !body.model || !body.limit || body.score_threshold === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: image, model, limit, score_threshold' 
        },
        { status: 400 }
      )
    }

    // Validate model type
    if (!['v2', 'v3'].includes(body.model)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid model. Must be "v2" or "v3"' 
        },
        { status: 400 }
      )
    }

    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    
    // Forward the request to the backend service
    const backendResponse = await fetch(`${backendUrl}/image-similarity-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend error:', errorText)
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend service error: ${backendResponse.status} ${backendResponse.statusText}`,
          details: errorText
        },
        { status: backendResponse.status }
      )
    }

    const data: SimilaritySearchResponse = await backendResponse.json()

    // Return the response with CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}





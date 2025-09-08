# API Setup Instructions

## Backend Service Configuration

To resolve the CORS and 404 errors, I've created a Next.js API route that proxies requests to your backend service.

### What was implemented:

1. **API Route**: `/src/app/api/segmentation/route.ts`
   - Handles CORS by adding proper headers
   - Proxies requests to your backend service
   - Provides better error handling

2. **Frontend Update**: Updated the segmentation page to use the new API route instead of direct backend calls

### Environment Configuration:

Create a `.env.local` file in your project root with:

```
BACKEND_URL=http://127.0.0.1:8000
```

### How it works:

1. Frontend sends request to `/api/segmentation`
2. Next.js API route forwards the request to your backend service
3. Backend service processes the segmentation
4. Response is returned through the API route with proper CORS headers

### Testing:

1. Make sure your backend service is running on port 8000
2. Start your Next.js development server: `npm run dev`
3. The segmentation should now work without CORS errors

### Troubleshooting:

- If you get "Unable to connect to the segmentation service", ensure your backend is running
- Check the browser console for detailed error messages
- Verify the backend URL in the API route matches your service


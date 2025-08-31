import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Brain, 
  Zap, 
  Clock, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Database,
  BarChart3,
  Settings,
  Users,
  Image as ImageIcon,
  Scissors
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">HelloShop AI Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Model Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4M</div>
              {/* <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                +15.3% from last month
              </p> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127ms</div>
             
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.7%</div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Models</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
         
            </CardContent>
          </Card>
        </div>
         {/* Quick Actions */}
         <div className="mt-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and system management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <Link href="/image-similarity">
                    <ImageIcon className="h-4 w-4" />
                    Image Similarity Search
                  </Link>
                </Button>
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <Link href="/image-segmentation">
                    <Scissors className="h-4 w-4" />
                    Image Segmentation
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
 
        {/* Model Usage Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Models */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Models</CardTitle>
              <CardDescription>Models with highest usage and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "GPT-4 Turbo", calls: "892K", accuracy: "98.5%", latency: "89ms" },
                  { name: "Claude-3 Opus", calls: "567K", accuracy: "97.2%", latency: "112ms" },
                  { name: "Gemini Pro", calls: "423K", accuracy: "96.8%", latency: "134ms" },
                  { name: "LLaMA-3", calls: "298K", accuracy: "95.1%", latency: "156ms" },
                ].map((model, index) => (
                  <div key={model.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-gray-600">{model.calls} calls</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{model.accuracy}</p>
                      <Badge variant="outline" className="text-xs">
                        {model.latency}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage by Model Type */}
          <Card>
            <CardHeader>
              <CardTitle>Usage by Model Type</CardTitle>
              <CardDescription>Distribution of API calls across different model categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "Text Generation", usage: "45%", calls: "1.08M", color: "bg-blue-500" },
                  { type: "Image Generation", usage: "28%", calls: "672K", color: "bg-green-500" },
                  { type: "Code Generation", usage: "18%", calls: "432K", color: "bg-purple-500" },
                  { type: "Audio Processing", usage: "9%", calls: "216K", color: "bg-orange-500" },
                ].map((category) => (
                  <div key={category.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 ${category.color} rounded-full mr-3`}></div>
                      <div>
                        <p className="font-medium">{category.type}</p>
                        <p className="text-sm text-gray-600">{category.calls} calls</p>
                      </div>
                    </div>
                    <p className="font-medium">{category.usage}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis and system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Memory Usage</h3>
                  <p className="text-2xl font-bold text-blue-600">78%</p>
                  <p className="text-sm text-gray-600">12.4GB / 16GB</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">CPU Load</h3>
                  <p className="text-2xl font-bold text-green-600">42%</p>
                  <p className="text-sm text-gray-600">Average across cores</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Error Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">0.3%</p>
                  <p className="text-sm text-gray-600">7,200 errors today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

       
      </main>
    </div>
  )
}

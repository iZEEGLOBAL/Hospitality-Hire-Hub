import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Download, 
  FileText, 
  Video, 
  BookOpen, 
  Headphones,
  ExternalLink,
  Bookmark,
  Star,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/axios';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'ebook' | 'audio';
  category: string;
  fileUrl: string;
  thumbnailUrl?: string;
  author: string;
  duration?: string;
  rating: number;
  downloadCount: number;
  isPremium: boolean;
  createdAt: string;
}

export default function JobSeekerResources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      const response = await api.get(`/resources?${params.toString()}`);
      return response.data.data.resources;
    },
  });

  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'interview', name: 'Interview Tips' },
    { id: 'resume', name: 'Resume Writing' },
    { id: 'career', name: 'Career Growth' },
    { id: 'skills', name: 'Skill Development' },
    { id: 'industry', name: 'Industry Insights' },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'ebook':
        return <BookOpen className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'ebook':
        return 'bg-green-100 text-green-800';
      case 'audio':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResources = resources?.filter((resource: Resource) => {
    if (selectedCategory === 'all') return true;
    return resource.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Resources</h1>
          <p className="text-gray-600 mt-1">
            Access articles, videos, ebooks, and more to boost your career
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="downloaded">Downloaded</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading resources...</p>
            </div>
          ) : filteredResources?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources?.map((resource: Resource) => (
                <Card key={resource._id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Thumbnail */}
                    <div className="relative h-40 bg-gray-100 rounded-t-lg overflow-hidden">
                      {resource.thumbnailUrl ? (
                        <img
                          src={resource.thumbnailUrl}
                          alt={resource.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          {getResourceIcon(resource.type)}
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge className={getTypeColor(resource.type)}>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </Badge>
                      </div>
                      {resource.isPremium && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>By {resource.author}</span>
                        {resource.duration && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {resource.duration}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{resource.rating}</span>
                          <span className="text-sm text-gray-500">
                            ({resource.downloadCount} downloads)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardContent className="p-12 text-center">
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved resources</h3>
              <p className="text-gray-600 mb-4">
                Bookmark resources to access them quickly later
              </p>
              <Button onClick={() => document.querySelector('[value="all"]')?.dispatchEvent(new Event('click'))}>
                Browse Resources
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloaded">
          <Card>
            <CardContent className="p-12 text-center">
              <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads yet</h3>
              <p className="text-gray-600 mb-4">
                Resources you download will appear here
              </p>
              <Button onClick={() => document.querySelector('[value="all"]')?.dispatchEvent(new Event('click'))}>
                Browse Resources
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

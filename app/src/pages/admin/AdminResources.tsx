import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Plus,
  FileText,
  Video,
  BookOpen,
  Headphones,
  Edit3,
  Trash2,
  Eye,
  Download,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { Link } from 'react-router-dom';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'ebook' | 'audio';
  category: string;
  author: string;
  downloadCount: number;
  rating: number;
  isPremium: boolean;
  createdAt: string;
}

export default function AdminResources() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources, isLoading } = useQuery({
    queryKey: ['adminResources'],
    queryFn: async () => {
      const response = await api.get('/admin/resources');
      return response.data.data.resources;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await api.delete(`/admin/resources/${resourceId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminResources'] });
      toast.success('Resource has been deleted.', { title: 'Resource deleted' });
    },
    onError: () => {
      toast.error('Failed to delete resource.', { title: 'Error' });
    },
  });

  const filteredResources = resources?.filter((r: Resource) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'ebook': return <BookOpen className="h-5 w-5" />;
      case 'audio': return <Headphones className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getResourcesByType = (type: string) => {
    if (type === 'all') return filteredResources;
    return filteredResources?.filter((r: Resource) => r.type === type);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600 mt-1">Manage learning resources and content</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/admin/resources/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Resources</p><p className="text-2xl font-bold">{resources?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Articles</p><p className="text-2xl font-bold">{resources?.filter((r: Resource) => r.type === 'article').length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Videos</p><p className="text-2xl font-bold">{resources?.filter((r: Resource) => r.type === 'video').length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Downloads</p><p className="text-2xl font-bold">{resources?.reduce((acc: number, r: Resource) => acc + r.downloadCount, 0) || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search resources..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="article">Articles</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="ebook">Ebooks</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
        </TabsList>

        {['all', 'article', 'video', 'ebook', 'audio'].map((type) => (
          <TabsContent key={type} value={type}>
            {isLoading ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" /><p className="mt-4 text-gray-600">Loading...</p></div>
            ) : getResourcesByType(type)?.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getResourcesByType(type)?.map((resource: Resource) => (
                  <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getTypeIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{resource.title}</h3>
                            {resource.isPremium && <Badge className="bg-yellow-100 text-yellow-800"><Star className="h-3 w-3 mr-1" />Premium</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{resource.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>By {resource.author}</span>
                            <span className="flex items-center"><Download className="h-3 w-3 mr-1" />{resource.downloadCount}</span>
                            <span className="flex items-center"><Star className="h-3 w-3 mr-1" />{resource.rating}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button>
                            <Button variant="outline" size="sm"><Edit3 className="h-4 w-4 mr-1" />Edit</Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to delete "{resource.title}"?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMutation.mutate(resource._id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

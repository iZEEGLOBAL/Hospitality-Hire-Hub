import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Plus,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function AdminGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gallery, isLoading } = useQuery({
    queryKey: ['adminGallery'],
    queryFn: async () => {
      const response = await api.get('/admin/gallery');
      return response.data.data.gallery;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await api.delete(`/admin/gallery/${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGallery'] });
      toast.success('Gallery item has been deleted.', { title: 'Item deleted' });
    },
    onError: () => {
      toast.error('Failed to delete item.', { title: 'Error' });
    },
  });

  const filteredGallery = gallery?.filter((item: GalleryItem) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getItemsByCategory = (category: string) => {
    if (category === 'all') return filteredGallery;
    return filteredGallery?.filter((item: GalleryItem) => item.category === category);
  };

  const categories = ['all', 'events', 'training', 'facilities', 'team', 'partners'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600 mt-1">Manage gallery images and media</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/admin/gallery/upload">
            <Plus className="h-4 w-4 mr-2" />
            Upload Image
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Images</p><p className="text-2xl font-bold">{gallery?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Events</p><p className="text-2xl font-bold">{gallery?.filter((i: GalleryItem) => i.category === 'events').length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Training</p><p className="text-2xl font-bold">{gallery?.filter((i: GalleryItem) => i.category === 'training').length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Facilities</p><p className="text-2xl font-bold">{gallery?.filter((i: GalleryItem) => i.category === 'facilities').length || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search gallery..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">{cat}</TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            {isLoading ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" /><p className="mt-4 text-gray-600">Loading...</p></div>
            ) : getItemsByCategory(category)?.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getItemsByCategory(category)?.map((item: GalleryItem) => (
                  <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-100 relative group">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary"><Eye className="h-4 w-4" /></Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader><DialogTitle>{item.title}</DialogTitle></DialogHeader>
                            <img src={item.imageUrl} alt={item.title} className="w-full rounded-lg" />
                            <p className="text-gray-600">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center"><User className="h-4 w-4 mr-1" />{item.uploadedBy.firstName} {item.uploadedBy.lastName}</span>
                              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="capitalize text-xs">{item.category}</Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit3 className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Delete Image?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{item.title}"?</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(item._id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

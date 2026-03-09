import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MessageSquare,
  ThumbsUp,
  Flag,
  Eye,
  Trash2,
  User,
  CheckCircle,
  XCircle
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

interface Post {
  _id: string;
  author: {
    firstName: string;
    lastName: string;
    role: string;
  };
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  isReported: boolean;
  reportCount: number;
  status: 'active' | 'hidden' | 'removed';
  createdAt: string;
}

export default function AdminCommunity() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: async () => {
      const response = await api.get('/admin/community');
      return response.data.data.posts;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: string }) => {
      const response = await api.patch(`/admin/community/${postId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Post status has been updated.', { title: 'Status updated' });
    },
    onError: () => {
      toast.error('Failed to update status.', { title: 'Error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.delete(`/admin/community/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Post has been deleted.', { title: 'Post deleted' });
    },
    onError: () => {
      toast.error('Failed to delete post.', { title: 'Error' });
    },
  });

  const filteredPosts = posts?.filter((post: Post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${post.author.firstName} ${post.author.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'hidden': return <Badge className="bg-yellow-100 text-yellow-800"><Eye className="h-3 w-3 mr-1" />Hidden</Badge>;
      case 'removed': return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Removed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Community Management</h1>
        <p className="text-gray-600 mt-1">Manage community posts and discussions</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Posts</p><p className="text-2xl font-bold">{posts?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold">{posts?.filter((p: Post) => p.status === 'active').length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Reported</p><p className="text-2xl font-bold text-red-600">{posts?.filter((p: Post) => p.isReported).length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Likes</p><p className="text-2xl font-bold">{posts?.reduce((acc: number, p: Post) => acc + p.likes, 0) || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="reported">Reported</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="hidden">Hidden</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PostsList 
            posts={filteredPosts} 
            isLoading={isLoading} 
            statusMutation={statusMutation}
            deleteMutation={deleteMutation}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="reported">
          <PostsList 
            posts={filteredPosts?.filter((p: Post) => p.isReported)} 
            isLoading={isLoading} 
            statusMutation={statusMutation}
            deleteMutation={deleteMutation}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="active">
          <PostsList 
            posts={filteredPosts?.filter((p: Post) => p.status === 'active')} 
            isLoading={isLoading} 
            statusMutation={statusMutation}
            deleteMutation={deleteMutation}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="hidden">
          <PostsList 
            posts={filteredPosts?.filter((p: Post) => p.status === 'hidden')} 
            isLoading={isLoading} 
            statusMutation={statusMutation}
            deleteMutation={deleteMutation}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PostsList({ 
  posts, 
  isLoading, 
  statusMutation, 
  deleteMutation,
  getStatusBadge 
}: any) {
  if (isLoading) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" /><p className="mt-4 text-gray-600">Loading...</p></div>;
  }

  if (posts?.length === 0) {
    return <Card><CardContent className="p-12 text-center"><MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {posts?.map((post: Post) => (
        <Card key={post._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-brand-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  <Badge variant="outline" className="capitalize">{post.category}</Badge>
                  {getStatusBadge(post.status)}
                  {post.isReported && <Badge className="bg-red-100 text-red-800"><Flag className="h-3 w-3 mr-1" />Reported ({post.reportCount})</Badge>}
                </div>
                <p className="text-sm text-gray-600 mb-2">By {post.author.firstName} {post.author.lastName} · {new Date(post.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-700 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center"><ThumbsUp className="h-4 w-4 mr-1" />{post.likes}</span>
                  <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" />{post.comments}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader><DialogTitle>Post Details</DialogTitle></DialogHeader>
                      {post && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">{getStatusBadge(post.status)}<Badge variant="outline" className="capitalize">{post.category}</Badge></div>
                          <h3 className="text-xl font-semibold">{post.title}</h3>
                          <p className="text-sm text-gray-600">By {post.author.firstName} {post.author.lastName} · {new Date(post.createdAt).toLocaleDateString()}</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center"><ThumbsUp className="h-4 w-4 mr-1" />{post.likes} likes</span>
                            <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" />{post.comments} comments</span>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  {post.status === 'active' && <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ postId: post._id, status: 'hidden' })}><Eye className="h-4 w-4 mr-1" />Hide</Button>}
                  {post.status === 'hidden' && <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ postId: post._id, status: 'active' })}><CheckCircle className="h-4 w-4 mr-1" />Show</Button>}
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="text-red-600"><Trash2 className="h-4 w-4 mr-1" />Delete</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete Post?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this post?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(post._id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

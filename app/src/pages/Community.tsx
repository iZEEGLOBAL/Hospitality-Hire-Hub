import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types';

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trending, setTrending] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchPosts();
    fetchTrending();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/community/posts');
      setPosts(response.data.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await api.get('/community/trending');
      setTrending(response.data.data);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Community</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Connect with hospitality professionals, share experiences, and learn from each other
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Community Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Members
                      </span>
                      <span className="font-semibold">2,500+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Posts
                      </span>
                      <span className="font-semibold">1,200+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Trending</h3>
                  <div className="space-y-3">
                    {trending.map((post) => (
                      <Link key={post._id} to={`/community/posts/${post._id}`}>
                        <div className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {post.title || post.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {post.views} views
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-3">
              {/* Create Post */}
              {isAuthenticated && (
                <Card className="mb-6 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user?.firstName?.[0]}
                      </div>
                      <Input
                        placeholder="Share your thoughts or ask a question..."
                        className="flex-1"
                        readOnly
                        onClick={() => {}}
                      />
                      <Button>Post</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">No posts yet</h3>
                    <p className="text-gray-600">Be the first to start a discussion</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <Card key={post._id} className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                            {post.authorName?.[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">{post.authorName}</span>
                              <Badge variant="secondary" className="text-xs">
                                {post.category}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-4">{post.content}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                <Heart className="h-4 w-4" />
                                {post.likes?.length || 0}
                              </button>
                              <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                                <MessageCircle className="h-4 w-4" />
                                {post.comments?.length || 0}
                              </button>
                              <span>{post.views} views</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Lock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import type { Resource } from '../types';

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    accessType: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchResources();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/resources/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/resources?${params.toString()}`);
      setResources(response.data.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Resource Library</h1>
          <p className="text-blue-100">Free and premium hospitality training materials</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.accessType}
              onValueChange={(value) => setFilters({ ...filters, accessType: value })}
            >
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Access Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchResources} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge
                        className={
                          resource.accessType === 'free'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }
                      >
                        {resource.accessType === 'free' ? 'Free' : 'Premium'}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        <Download className="h-4 w-4 inline mr-1" />
                        {resource.downloadCount} downloads
                      </span>
                      {resource.accessType === 'premium' && user?.subscription?.plan === 'free' ? (
                        <Link to="/pricing">
                          <Button size="sm" variant="outline">
                            <Lock className="h-4 w-4 mr-1" />
                            Upgrade
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm">Download</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

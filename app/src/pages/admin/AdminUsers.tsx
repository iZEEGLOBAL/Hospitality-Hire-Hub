import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Building2,
  Briefcase,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  createdAt: string;
  lastLogin: string;
  jobSeekerProfile?: {
    headline: string;
  };
  employerProfile?: {
    companyName: string;
  };
}

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data.data.users;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await api.patch(`/admin/users/${userId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User status has been updated.', { title: 'Status updated' });
    },
    onError: () => {
      toast.error('Failed to update status.', { title: 'Error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User has been deleted.', { title: 'User deleted' });
    },
    onError: () => {
      toast.error('Failed to delete user.', { title: 'Error' });
    },
  });

  const filteredUsers = users?.filter((user: User) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'jobseeker':
        return <Badge className="bg-blue-100 text-blue-800"><Briefcase className="h-3 w-3 mr-1" />Job Seeker</Badge>;
      case 'employer':
        return <Badge className="bg-green-100 text-green-800"><Building2 className="h-3 w-3 mr-1" />Employer</Badge>;
      case 'consultation_client':
        return <Badge className="bg-orange-100 text-orange-800"><UserCheck className="h-3 w-3 mr-1" />Client</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 flex items-center w-fit"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="flex items-center w-fit"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 flex items-center w-fit"><UserX className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUsersByRole = (role: string) => {
    if (role === 'all') return filteredUsers;
    return filteredUsers?.filter((user: User) => user.role === role);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">
          Manage all users on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{users?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Job Seekers</p>
            <p className="text-2xl font-bold">{users?.filter((u: User) => u.role === 'jobseeker').length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Employers</p>
            <p className="text-2xl font-bold">{users?.filter((u: User) => u.role === 'employer').length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold">{users?.filter((u: User) => u.status === 'active').length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">New Today</p>
            <p className="text-2xl font-bold">
              {users?.filter((u: User) => {
                const today = new Date();
                const created = new Date(u.createdAt);
                return today.toDateString() === created.toDateString();
              }).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="jobseeker">Job Seekers</TabsTrigger>
          <TabsTrigger value="employer">Employers</TabsTrigger>
          <TabsTrigger value="consultation_client">Clients</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
        </TabsList>

        {['all', 'jobseeker', 'employer', 'consultation_client', 'admin'].map((role) => (
          <TabsContent key={role} value={role}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : getUsersByRole(role)?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getUsersByRole(role)?.map((user: User) => (
                  <Card key={user._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-brand-100 text-brand-600">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user.status)}
                            {user.isVerified && (
                              <Badge className="bg-brand-100 text-brand-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {user.email}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                            {user.lastLogin && (
                              <span className="flex items-center">
                                Last login {new Date(user.lastLogin).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {user.jobSeekerProfile?.headline && (
                            <p className="text-sm text-gray-600 mt-2">{user.jobSeekerProfile.headline}</p>
                          )}
                          {user.employerProfile?.companyName && (
                            <p className="text-sm text-gray-600 mt-2">
                              <Building2 className="h-4 w-4 inline mr-1" />
                              {user.employerProfile.companyName}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarFallback className="bg-brand-100 text-brand-600 text-lg">
                                        {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="font-semibold text-lg">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                      </h3>
                                      <p className="text-gray-600">{selectedUser.email}</p>
                                      <div className="flex gap-2 mt-1">
                                        {getRoleBadge(selectedUser.role)}
                                        {getStatusBadge(selectedUser.status)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Joined:</span>
                                      <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Last Login:</span>
                                      <p>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Verified:</span>
                                      <p>{selectedUser.isVerified ? 'Yes' : 'No'}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <button className="w-full flex items-center">
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit User
                                </button>
                              </DropdownMenuItem>
                              {user.status === 'active' ? (
                                <DropdownMenuItem 
                                  onClick={() => statusMutation.mutate({ userId: user._id, status: 'suspended' })}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => statusMutation.mutate({ userId: user._id, status: 'active' })}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(user._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

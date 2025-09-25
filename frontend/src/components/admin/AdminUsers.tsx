import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Shield,
  ShieldOff,
  Download
} from 'lucide-react'
import axios from 'axios'
import { formatDate } from '@/lib/utils'
import { User } from '@/stores/authStore'
import toast from 'react-hot-toast'

interface UserFilters {
  search: string
  role: string
  isActive: string
  page: number
  limit: number
}

interface UsersResponse {
  users: User[]
  pagination: {
    currentPage: number
    totalPages: number
    totalUsers: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    isActive: '',
    page: 1,
    limit: 20
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const response = await axios.get(`/admin/users?${params}`)
      const data: UsersResponse = response.data.data
      
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await axios.put(`/admin/users/${userId}/role`, { role: newRole })
      toast.success(`User role updated to ${newRole}`)
      fetchUsers()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update user role'
      toast.error(message)
    }
  }

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await axios.put(`/admin/users/${userId}/status`, { isActive })
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update user status'
      toast.error(message)
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'destructive' : 'outline'
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'destructive'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-300">Manage user accounts and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{pagination.totalUsers}</div>
            <div className="text-sm text-gray-300">Total Users</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-300">Active Users</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-300">Admins</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-400">
              {users.filter(u => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(u.createdAt) > weekAgo
              }).length}
            </div>
            <div className="text-sm text-gray-300">New This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-white">Loading users...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Last Login</TableHead>
                    <TableHead className="text-gray-300">Joined</TableHead>
                    <TableHead className="text-gray-300">Orders</TableHead>
                    <TableHead className="w-32 text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(user.isActive)}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-400">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-400">
                          {formatDate(user.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-white">
                          {user.orderHistory?.length || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            title="View Details"
                            className="text-gray-400 hover:text-white hover:bg-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {user.role === 'user' ? (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              title="Make Admin"
                              onClick={() => handleUpdateUserRole(user.id, 'admin')}
                              className="text-gray-400 hover:text-blue-400 hover:bg-gray-600"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              title="Remove Admin"
                              onClick={() => handleUpdateUserRole(user.id, 'user')}
                              className="text-gray-400 hover:text-orange-400 hover:bg-gray-600"
                            >
                              <ShieldOff className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                            onClick={() => handleUpdateUserStatus(user.id, !user.isActive)}
                            className="text-gray-400 hover:text-red-400 hover:bg-gray-600"
                          >
                            {user.isActive ? (
                              <Trash2 className="h-4 w-4" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {(pagination.currentPage - 1) * filters.limit + 1} to{' '}
                    {Math.min(pagination.currentPage * filters.limit, pagination.totalUsers)} of{' '}
                    {pagination.totalUsers} users
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!pagination.hasPrev}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!pagination.hasNext}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

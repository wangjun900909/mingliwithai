"use client";

import { useState, useEffect } from 'react';

interface UserData {
  username: string;
  userInfo: {
    mbti?: string;
    gender?: string;
    profession?: string;
    status?: string;
    age?: string;
    maritalStatus?: string;
    hasChildren?: string;
    birthday?: {
      date?: string;
      month?: number;
      day?: number;
    };
  };
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ManagerTool() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'username'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 获取所有用户数据
  const fetchAllUsers = async () => {
    try {
      console.log('开始获取用户数据...')
      setError(null)
      const response = await fetch('/api/users/all')
      console.log('响应状态:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API返回的数据:', data)
        console.log('用户数量:', data.users?.length || 0)
        
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users)
          console.log('成功设置用户数据，数量:', data.users.length)
        } else {
          console.error('API返回数据格式错误:', data)
          setUsers([])
          setError('API返回数据格式错误')
        }
      } else {
        console.error('获取用户列表失败:', response.status, response.statusText)
        setUsers([])
        setError(`请求失败: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      setUsers([])
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // 过滤和排序用户
  const filteredAndSortedUsers = users
    .filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userInfo.mbti?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userInfo.birthday?.date?.includes(searchTerm)
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'username':
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // 添加调试信息
  console.log('原始用户数量:', users.length);
  console.log('过滤后用户数量:', filteredAndSortedUsers.length);
  console.log('搜索词:', searchTerm);

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取性别显示文本
  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'male': return '男';
      case 'female': return '女';
      case 'other': return '其他';
      default: return '未填写';
    }
  };

  // 获取婚姻状况显示文本
  const getMaritalStatusText = (status?: string) => {
    switch (status) {
      case 'single': return '单身';
      case 'married': return '已婚';
      case 'divorced': return '离异';
      case 'widowed': return '丧偶';
      case 'other': return '其他';
      default: return '未填写';
    }
  };

  // 获取子女情况显示文本
  const getChildrenText = (children?: string) => {
    switch (children) {
      case 'none': return '无子女';
      case 'one': return '1个孩子';
      case 'two': return '2个孩子';
      case 'three': return '3个孩子';
      case 'more': return '3个以上孩子';
      default: return '未填写';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">用户管理工具</h1>
          <p className="text-gray-600">浏览所有用户的基本信息、生日和历史问答</p>
        </div>

        {/* 搜索和排序控制 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索用户</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索用户名、MBTI或生日..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="updatedAt">最后更新</option>
                  <option value="createdAt">创建时间</option>
                  <option value="username">用户名</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">排序顺序</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">降序</option>
                  <option value="asc">升序</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <h3 className="text-lg font-semibold">加载失败</h3>
              <p>{error}</p>
            </div>
            <button 
              onClick={fetchAllUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 调试信息 */}
            <div className="lg:col-span-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">调试信息</h3>
              <p className="text-xs text-yellow-700">原始用户数量: {users.length}</p>
              <p className="text-xs text-yellow-700">过滤后用户数量: {filteredAndSortedUsers.length}</p>
              <p className="text-xs text-yellow-700">搜索词: "{searchTerm}"</p>
            </div>
            {/* 用户列表 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">用户列表 ({filteredAndSortedUsers.length})</h2>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredAndSortedUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      没有找到用户
                    </div>
                  ) : (
                    filteredAndSortedUsers.map((user) => (
                      <div
                        key={user.username}
                        onClick={() => setSelectedUser(user)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedUser?.username === user.username ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{user.username}</h3>
                            <p className="text-sm text-gray-600">
                              {user.userInfo.mbti || '未填写MBTI'} • {user.userInfo.birthday?.date || '未选择生日'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(user.updatedAt)}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {user.messages.length} 条对话记录
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 用户详情 */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">{selectedUser.username}</h2>
                      <div className="text-sm text-gray-500">
                        创建于 {formatDate(selectedUser.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* 基本信息 */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">MBTI类型</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.userInfo.mbti || '未填写'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">性别</label>
                          <p className="mt-1 text-sm text-gray-900">{getGenderText(selectedUser.userInfo.gender)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">年龄</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.userInfo.age || '未填写'}岁</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">婚姻状况</label>
                          <p className="mt-1 text-sm text-gray-900">{getMaritalStatusText(selectedUser.userInfo.maritalStatus)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">子女情况</label>
                          <p className="mt-1 text-sm text-gray-900">{getChildrenText(selectedUser.userInfo.hasChildren)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">职业</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.userInfo.profession || '未填写'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">当前状态</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.userInfo.status || '未填写'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">生日</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.userInfo.birthday?.date || '未选择'}</p>
                        </div>
                      </div>
                    </div>

                    {/* 对话历史 */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">对话历史 ({selectedUser.messages.length} 条)</h3>
                      <div className="max-h-96 overflow-y-auto space-y-4">
                        {selectedUser.messages.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">暂无对话记录</p>
                        ) : (
                          selectedUser.messages.map((message, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg ${
                                message.role === 'user' 
                                  ? 'bg-blue-50 border border-blue-200' 
                                  : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                  message.role === 'user' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {message.role === 'user' ? '用户' : 'AI助手'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(message.timestamp)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                {message.content}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">选择用户</h3>
                  <p className="text-gray-500">从左侧列表中选择一个用户查看详细信息</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
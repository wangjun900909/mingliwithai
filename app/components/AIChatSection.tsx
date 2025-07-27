"use client";

import { useState, useRef, useEffect } from 'react';
import { CookieManager, UserInfo } from '../utils/cookieManager';

// AI服务配置
const AI_SERVICES = [
  { id: 'auto', name: '自动选择', description: '自动选择最佳AI服务' },
  { id: 'deepseek', name: 'DeepSeek AI', description: '深度思考AI服务' },
  { id: 'yuanbao', name: '元宝AI', description: '元宝智能服务' },
  { id: 'doubao', name: '豆包AI', description: '豆包智能服务' }
];

export default function AIChatSection({ birthdayData }: { birthdayData: any }) {
  const [username, setUsername] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    mbti: '',
    gender: '',
    profession: '',
    status: '',
    age: '',
    maritalStatus: '',
    hasChildren: ''
  });
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [selectedAIService, setSelectedAIService] = useState('yuanbao');
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [currentBirthdayData, setCurrentBirthdayData] = useState<any>(birthdayData);
  const [hasLoadedUserData, setHasLoadedUserData] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当birthdayData变化时更新currentBirthdayData，但只在没有用户数据时
  useEffect(() => {
    // 只有在没有加载到用户生日数据时才使用传入的birthdayData
    if (!hasLoadedUserData && (!currentBirthdayData || !currentBirthdayData.date)) {
      setCurrentBirthdayData(birthdayData);
    }
  }, [birthdayData, hasLoadedUserData]);

  // 从cookie加载用户信息
  useEffect(() => {
    const savedUserInfo = CookieManager.getUserInfo();
    if (savedUserInfo) {
      setUserInfo(savedUserInfo);
    }
  }, []);

  // 保存用户信息到cookie
  const saveUserInfo = (newUserInfo: Partial<UserInfo>) => {
    const updatedInfo = { ...userInfo, ...newUserInfo };
    setUserInfo(updatedInfo);
    CookieManager.saveUserInfo(updatedInfo);
  };

  // 加载用户信息
  const loadUserData = async () => {
    if (!username.trim()) {
      alert('请输入用户名');
      return;
    }

    setIsLoadingUser(true);
    try {
      const response = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log('加载的用户数据:', data.data);
          setUserInfo(data.data.userInfo);
          setMessages(data.data.messages || []);
          
          // 如果加载的数据中有生日信息，更新currentBirthdayData
          if (data.data.userInfo.birthday) {
            console.log('设置生日数据:', data.data.userInfo.birthday);
            setCurrentBirthdayData(data.data.userInfo.birthday);
            setHasLoadedUserData(true);
          } else {
            console.log('用户数据中没有生日信息');
          }
          
          alert('用户信息加载成功！');
        }
      } else if (response.status === 404) {
        alert('用户不存在，请输入正确的用户名');
      } else {
        alert('加载用户信息失败');
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      alert('加载用户信息失败');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // 保存用户信息到数据库
  const saveUserData = async () => {
    if (!username.trim()) {
      alert('请输入用户名');
      return;
    }

    setIsSavingUser(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          userInfo: {
            ...userInfo,
            birthday: currentBirthdayData
          },
          messages
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || '用户信息保存成功！');
      } else {
        alert('保存用户信息失败');
      }
    } catch (error) {
      console.error('保存用户信息失败:', error);
      alert('保存用户信息失败');
    } finally {
      setIsSavingUser(false);
    }
  };

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息到AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    // 手机端发送消息后隐藏键盘
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    try {
      const requestData = {
        messages: [
          ...messages,
          { role: 'user', content: userMessage }
        ],
        userInfo: {
          ...userInfo,
          birthday: currentBirthdayData
        },
        aiService: selectedAIService
      };
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) throw new Error('API请求失败');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('请求出错:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，请求出错，请稍后再试' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-purple-700">AI 智能对话分析</h2>
      
      {/* 用户名管理 */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs sm:text-sm text-blue-700">用户信息管理</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={loadUserData}
            disabled={isLoadingUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {isLoadingUser ? '加载中...' : '加载资料'}
          </button>
          <button
            onClick={saveUserData}
            disabled={isSavingUser}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {isSavingUser ? '保存中...' : '保存资料'}
          </button>
        </div>
        <p className="text-xs text-blue-600 mt-2">输入用户名可加载之前保存的个人信息和对话记录</p>
      </div>
      
      {/* AI服务选择 */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">选择AI服务</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AI_SERVICES.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedAIService(service.id)}
              className={`p-2 sm:p-3 rounded-lg border text-xs sm:text-sm transition-all duration-200 ${
                selectedAIService === service.id
                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{service.name}</div>
              <div className="text-xs text-gray-500 mt-1 hidden sm:block">{service.description}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* 用户信息表单 - 手机端可折叠 */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3 sm:hidden"
        >
          <span className="text-sm font-medium text-gray-700">个人信息设置</span>
          <span className={`transform transition-transform ${showForm ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        <div className={`${showForm ? 'block' : 'hidden'} sm:block`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="请输入用户名"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MBTI类型</label>
              <input
                type="text"
                value={userInfo.mbti}
                onChange={(e) => saveUserInfo({ mbti: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例如: INTJ"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
              <select
                value={userInfo.gender}
                onChange={(e) => saveUserInfo({ gender: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
              <input
                type="number"
                value={userInfo.age}
                onChange={(e) => saveUserInfo({ age: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例如: 25"
                min="1"
                max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">婚姻状况</label>
              <select
                value={userInfo.maritalStatus}
                onChange={(e) => saveUserInfo({ maritalStatus: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">请选择</option>
                <option value="single">单身</option>
                <option value="married">已婚</option>
                <option value="divorced">离异</option>
                <option value="widowed">丧偶</option>
                <option value="other">其他</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">子女情况</label>
              <select
                value={userInfo.hasChildren}
                onChange={(e) => saveUserInfo({ hasChildren: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">请选择</option>
                <option value="none">无子女</option>
                <option value="one">1个孩子</option>
                <option value="two">2个孩子</option>
                <option value="three">3个孩子</option>
                <option value="more">3个以上</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">职业</label>
              <input
                type="text"
                value={userInfo.profession}
                onChange={(e) => saveUserInfo({ profession: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例如: 软件工程师"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">当前状态</label>
              <input
                type="text"
                value={userInfo.status}
                onChange={(e) => saveUserInfo({ status: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例如: 正在找工作"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 服务信息 - 手机端简化显示 */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs sm:text-sm text-blue-700">使用 MCP 智能编排服务</span>
        </div>
        <p className="text-xs text-blue-600 mt-1 hidden sm:block">集成元宝AI、豆包AI、DeepSeek等多AI服务</p>
      </div>
      
      {/* 聊天区域 - 手机端优化高度 */}
      <div className="border border-gray-200 rounded-lg p-3 sm:p-4 h-64 sm:h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center px-4">
              <div className="text-2xl mb-2">🤖</div>
              <p className="text-sm sm:text-base">请填写个人信息并开始对话</p>
              <p className="text-xs text-gray-400 mt-1">AI将基于您的生日和MBTI提供个性化建议</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-3 sm:mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div className={`inline-block px-3 sm:px-4 py-2 rounded-lg max-w-[85%] sm:max-w-xs md:max-w-md text-sm sm:text-base ${
                msg.role === 'user' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-center text-gray-500">
            <div className="inline-block animate-pulse text-sm sm:text-base">AI思考中...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入区域 - 手机端优化 */}
      <div className="flex mb-3 sm:mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="输入您的问题..."
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 disabled:bg-gray-400 text-sm sm:text-base font-medium"
        >
          发送
        </button>
      </div>
      
      {/* 建议问题 - 手机端优化布局 */}
      <div className="mt-3 sm:mt-4">
        <p className="text-xs text-gray-500 mb-2">建议问题：</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "基于我的生日和MBTI，我适合什么职业？",
            "我的性格特点是什么？",
            "如何改善我的人际关系？",
            "我的优势和劣势是什么？",
            "我的婚姻和家庭生活会怎样？",
            "如何平衡工作和家庭？",
            "适合我的情人生日是？",
            "我的目前应该关注的身心灵问题是？",
            "这些名人在我这个年纪是如何面对生活的困难的？",
            "我该如何和去哪获得属于我的能量？"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion)}
              className="text-xs sm:text-sm px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      {/* 快捷操作 */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500">
          <span>当前生日: {currentBirthdayData?.date || '未选择'}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="text-purple-600 hover:text-purple-700"
            >
              {showForm ? '隐藏设置' : '显示设置'}
            </button>
            <button 
              onClick={() => {
                CookieManager.clearUserInfo();
                setUserInfo({
                  mbti: '',
                  gender: '',
                  profession: '',
                  status: '',
                  age: '',
                  maritalStatus: '',
                  hasChildren: ''
                });
              }}
              className="text-red-600 hover:text-red-700"
            >
              清除信息
            </button>
          </div>
        </div>
        {/* 调试信息 */}
        <div className="text-xs text-gray-400 mt-1">
          调试: currentBirthdayData = {JSON.stringify(currentBirthdayData)}
        </div>
      </div>
    </div>
  );
} 
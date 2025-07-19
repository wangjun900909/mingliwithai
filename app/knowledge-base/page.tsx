"use client";

import { useState, useEffect } from 'react';

interface KnowledgeBaseStatus {
  birthday_intros: boolean;
  enhanced_date_matches: boolean;
  standard_date_matches: boolean;
  date_matches: boolean;
  total_dates: number;
}

interface BirthdayData {
  date: string;
  intro: any;
  matches: any;
}

export default function KnowledgeBasePage() {
  const [status, setStatus] = useState<KnowledgeBaseStatus | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [birthdayData, setBirthdayData] = useState<BirthdayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 获取知识库状态
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/knowledge-base');
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('获取知识库状态失败:', error);
    }
  };

  // 获取特定日期的数据
  const fetchBirthdayData = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/knowledge-base?date=${encodeURIComponent(date)}`);
      const data = await response.json();
      if (data.success) {
        setBirthdayData(data.data);
      }
    } catch (error) {
      console.error('获取生日数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化知识库
  const initializeKnowledgeBase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/knowledge-base');
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
        setMessage('知识库初始化成功！');
      }
    } catch (error) {
      console.error('初始化知识库失败:', error);
      setMessage('初始化知识库失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-800">
          生日知识库管理
        </h1>

        {/* 知识库状态 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">知识库状态</h2>
          {status ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 mb-1">生日介绍数据</div>
                <div className="text-2xl font-bold text-green-700">
                  {status.birthday_intros ? '✅ 已加载' : '❌ 未加载'}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">增强版匹配数据</div>
                <div className="text-2xl font-bold text-blue-700">
                  {status.enhanced_date_matches ? '✅ 已加载' : '❌ 未加载'}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 mb-1">标准版匹配数据</div>
                <div className="text-2xl font-bold text-orange-700">
                  {status.standard_date_matches ? '✅ 已加载' : '❌ 未加载'}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 mb-1">总日期数量</div>
                <div className="text-2xl font-bold text-purple-700">
                  {status.total_dates}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={initializeKnowledgeBase}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '初始化中...' : '重新初始化知识库'}
            </button>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* 日期查询 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">查询生日数据</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="输入日期，例如: 1月1日"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={() => fetchBirthdayData(selectedDate)}
              disabled={!selectedDate || loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '查询中...' : '查询'}
            </button>
          </div>
        </div>

        {/* 生日数据展示 */}
        {birthdayData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {birthdayData.date} 的数据
            </h2>
            
            {/* 生日介绍 */}
            {birthdayData.intro && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-700">生日介绍</h3>
                <div className="space-y-4">
                  {Object.entries(birthdayData.intro).map(([key, value]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">{key}</h4>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 生日匹配 */}
            {birthdayData.matches && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-700">生日匹配</h3>
                <div className="space-y-4">
                  {Object.entries(birthdayData.matches).map(([key, value]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">{key}</h4>
                      <div className="flex flex-wrap gap-2">
                        {(value as string[]).map((date, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm"
                          >
                            {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!birthdayData.intro && !birthdayData.matches && (
              <p className="text-gray-500 text-center py-8">未找到该日期的数据</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
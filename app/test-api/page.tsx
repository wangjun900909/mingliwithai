'use client'

import { useState, useEffect } from 'react'

export default function TestAPI() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('开始获取数据...')
        const response = await fetch('/api/users/all')
        console.log('响应状态:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('API返回数据:', result)
          setData(result)
        } else {
          console.error('API请求失败:', response.status)
          setError(`请求失败: ${response.status}`)
        }
      } catch (err) {
        console.error('获取数据失败:', err)
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API测试页面</h1>
      
      {loading && (
        <div className="text-blue-600">加载中...</div>
      )}
      
      {error && (
        <div className="text-red-600 mb-4">错误: {error}</div>
      )}
      
      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">API响应:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">用户列表:</h3>
          <div className="space-y-2">
            {data.users?.map((user: any, index: number) => (
              <div key={index} className="border p-3 rounded">
                <strong>{user.username}</strong> - {user.userInfo.mbti || '无MBTI'}
                {user.userInfo.birthday && (
                  <span className="ml-2 text-green-600">
                    (生日: {user.userInfo.birthday.date})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
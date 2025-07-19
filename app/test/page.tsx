'use client'

import { useState } from 'react'

export default function TestPage() {
  const [date, setDate] = useState('1月1日')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testQuery = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/data')
      const data = await response.json()
      const found = data.find((item: any) => item.主日期 === date)
      setResult(found)
    } catch (error) {
      console.error('查询失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">测试页面</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
          placeholder="输入日期"
        />
        <button
          onClick={testQuery}
          disabled={loading}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? '查询中...' : '查询'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">查询结果:</h2>
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
} 
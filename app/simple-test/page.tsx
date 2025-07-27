'use client'

import { useState } from 'react'

export default function SimpleTest() {
  const [result, setResult] = useState<string>('')

  const testAPI = async () => {
    try {
      setResult('正在测试...')
      const response = await fetch('/api/users/all')
      const data = await response.json()
      setResult(`成功! 用户数量: ${data.users?.length || 0}`)
    } catch (error) {
      setResult(`错误: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">简单API测试</h1>
      <button 
        onClick={testAPI}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
      >
        测试API
      </button>
      <div className="mt-4">
        <strong>结果:</strong> {result}
      </div>
    </div>
  )
} 
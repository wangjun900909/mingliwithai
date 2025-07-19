'use client'

import { useState } from 'react'
import AIChatSection from '../components/AIChatSection'

export default function MobileTestPage() {
  const [selectedMonth, setSelectedMonth] = useState(5)
  const [selectedDay, setSelectedDay] = useState(15)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 手机端测试标题 */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">手机端测试</h1>
          <p className="text-xs sm:text-sm text-gray-600">测试AI聊天功能的手机端适配</p>
        </div>

        {/* 当前选择显示 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="text-center">
            <span className="text-lg font-bold text-gray-800">
              {selectedMonth}月{selectedDay}日
            </span>
          </div>
        </div>

        {/* AI聊天组件 */}
        <AIChatSection birthdayData={{
          date: `${selectedMonth}月${selectedDay}日`,
          month: selectedMonth,
          day: selectedDay
        }} />

        {/* 手机端功能说明 */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-3">手机端优化特性</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>响应式设计，适配各种屏幕尺寸</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>触摸优化，按钮大小符合移动端标准</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>表单可折叠，节省屏幕空间</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>键盘优化，防止iOS缩放</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>滚动优化，支持触摸滚动</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>消息气泡自适应宽度</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ArrowRight, Heart, Users, Target, Star, Info } from 'lucide-react'
import AIChatSection from './components/AIChatSection'

interface MatchData {
  主日期: string
  匹配: {
    情人伴侣: string[]
    工作伙伴朋友: string[]
    竞争对手天敌: string[]
    灵魂伴侣: string[]
  }
}



interface BirthdayClassified {
  date: string
  found: boolean
  data: {
    kernel: string
    love_marriage: string
    work_finance: string
    personality: string
    path_to_self: string
    future_self: string
    past_self: string
  }
}

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [selectedDay, setSelectedDay] = useState(1)
  const [data, setData] = useState<MatchData[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'main' | 'classified'>('main')
  const [result, setResult] = useState<MatchData | null>(null)

  const [birthdayClassified, setBirthdayClassified] = useState<BirthdayClassified | null>(null)
  
  const monthScrollRef = useRef<HTMLDivElement>(null)
  const dayScrollRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // 解析日期字符串，提取月份和日期
  const parseDate = (dateStr: string) => {
    const match = dateStr.match(/(\d+)月(\d+)日/)
    if (match) {
      return { month: parseInt(match[1]), day: parseInt(match[2]) }
    }
    return null
  }

  // 滚动到指定位置并播放声音
  const scrollToDate = (dateStr: string) => {
    const parsed = parseDate(dateStr)
    if (!parsed) return

    // 播放滑轮声音
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }

    // 滚动月份选择器
    if (monthScrollRef.current) {
      const monthButton = monthScrollRef.current.querySelector(`[data-month="${parsed.month}"]`) as HTMLElement
      if (monthButton) {
        monthButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        setTimeout(() => setSelectedMonth(parsed.month), 300)
      }
    }

    // 滚动日期选择器
    if (dayScrollRef.current) {
      const dayButton = dayScrollRef.current.querySelector(`[data-day="${parsed.day}"]`) as HTMLElement
      if (dayButton) {
        dayButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        setTimeout(() => setSelectedDay(parsed.day), 300)
      }
    }
  }

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const dataResponse = await fetch('/api/data')
        const dataResult = await dataResponse.json()
        console.log('API返回的数据:', dataResult)
        // 如果返回的是包含matches的对象，则转换为数组格式
        if (dataResult.matches) {
          // 将对象格式转换为数组格式
          const matchesArray: MatchData[] = Object.entries(dataResult.matches).map(([date, matchData]) => ({
            主日期: date,
            匹配: matchData as {
              情人伴侣: string[]
              工作伙伴朋友: string[]
              竞争对手天敌: string[]
              灵魂伴侣: string[]
            }
          }))
          console.log('转换后的数组数据:', matchesArray)
          setData(matchesArray)
        } else {
          console.log('使用原始数据:', dataResult)
          setData(dataResult)
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 查询主日期
  const queryMainDate = () => {
    const dateStr = `${selectedMonth}月${selectedDay}日`
    console.log('查询日期:', dateStr)
    console.log('当前数据长度:', data.length)
    const found = data.find(item => item.主日期 === dateStr)
    console.log('找到的结果:', found)
    setResult(found || null)
  }



  // 查询分类生日介绍
  const queryBirthdayClassified = async () => {
    const dateStr = `${selectedMonth}月${selectedDay}日`
    try {
      const response = await fetch(`/api/birthday-classified?date=${encodeURIComponent(dateStr)}`)
      const classifiedData = await response.json()
      setBirthdayClassified(classifiedData)
      setResult(null)
    } catch (error) {
      console.error('查询分类生日介绍失败:', error)
      setBirthdayClassified({ 
        date: dateStr, 
        found: false,
        data: {
          kernel: '',
          love_marriage: '',
          work_finance: '',
          personality: '',
          path_to_self: '',
          future_self: '',
          past_self: ''
        }
      })
    }
  }

  // 当选择改变时自动查询
  useEffect(() => {
    if (data.length > 0) {
      if (activeTab === 'main') {
        queryMainDate()
      } else if (activeTab === 'classified') {
        queryBirthdayClassified()
      }
    }
  }, [selectedMonth, selectedDay, activeTab, data])

  // 按日期排序函数
  const sortDates = (dates: string[]) => {
    return dates.sort((a, b) => {
      const parseDate = (dateStr: string) => {
        const match = dateStr.match(/(\d+)月(\d+)日/)
        if (match) {
          return { month: parseInt(match[1]), day: parseInt(match[2]) }
        }
        return { month: 0, day: 0 }
      }
      
      const dateA = parseDate(a)
      const dateB = parseDate(b)
      
      // 先按月份排序，再按日期排序
      if (dateA.month !== dateB.month) {
        return dateA.month - dateB.month
      }
      return dateA.day - dateB.day
    })
  }

  // 处理内核内容，只显示前三行
  const processKernelContent = (kernelText: string) => {
    const lines = kernelText.split('\n').filter(line => line.trim())
    const firstThreeLines = lines.slice(0, 3).join('\n')
    const remainingLines = lines.slice(3).join('\n')
    return { firstThreeLines, remainingLines }
  }

  // 处理工作财运内容，删除重复的匹配数据
  const processWorkFinanceContent = (workFinanceText: string) => {
    // 查找从数字开始的匹配数据部分
    const matchIndex = workFinanceText.search(/\d{3}\n门月/)
    if (matchIndex !== -1) {
      // 只保留匹配数据之前的内容
      return workFinanceText.substring(0, matchIndex).trim()
    }
    return workFinanceText
  }

  // 提取生日名人
  const extractBirthdayCelebrities = (workFinanceText: string) => {
    const celebrityMatch = workFinanceText.match(/生日名人：\n([\s\S]*?)(?=\n·|$)/)
    if (celebrityMatch) {
      return celebrityMatch[1].trim()
    }
    return null
  }

  // 处理过去的你内容，删除无用信息
  const processPastSelfContent = (pastSelfText: string) => {
    if (!pastSelfText) return ''
    
    // 删除"前世"、"的故事"等格式化文本
    let processedText = pastSelfText
      .replace(/前\s*世\s*/g, '')
      .replace(/的\s*故\s*事\s*/g, '')
      .replace(/\d{3}\s*\n\s*\d+月\s*$/g, '') // 删除末尾的数字和月份
      .replace(/\n\s*\n\s*\n/g, '\n\n') // 清理多余的空行
      .trim()
    
    return processedText
  }

  // 渲染匹配列表
  const renderMatchList = (matches: string[], type: string, color: string) => {
    if (!matches || matches.length === 0) return null

    // 对日期进行排序
    const sortedMatches = sortDates([...matches])

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <span className="text-sm font-medium text-gray-700">{type}</span>
          <span className="text-xs text-gray-500">({matches.length}个)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sortedMatches.map((date, index) => (
            <button
              key={index}
              onClick={() => scrollToDate(date)}
              className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer"
            >
              {date}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-2 sm:p-4">
      {/* 音频元素 */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>

      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">日期匹配查询</h1>
          <p className="text-xs sm:text-sm text-gray-600">选择您的生日，查看匹配关系</p>
          
          {/* 导航链接 */}
          <div className="flex justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
            <a 
              href="#ai-chat-section" 
              className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              AI智能对话
            </a>
          </div>
        </div>

        {/* 月份选择器 */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">选择月份</label>
          <div 
            ref={monthScrollRef}
            className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <button
                key={month}
                data-month={month}
                onClick={() => {
                  setSelectedMonth(month)
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0
                    audioRef.current.play().catch(() => {})
                  }
                }}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all duration-200 ${
                  selectedMonth === month
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {month}月
              </button>
            ))}
          </div>
        </div>

        {/* 日期选择器 */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">选择日期</label>
          <div 
            ref={dayScrollRef}
            className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                data-day={day}
                onClick={() => {
                  setSelectedDay(day)
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0
                    audioRef.current.play().catch(() => {})
                  }
                }}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all duration-200 ${
                  selectedDay === day
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {day}日
              </button>
            ))}
          </div>
        </div>

        {/* 当前选择显示 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="text-center">
            <span className="text-lg font-bold text-gray-800">
              {selectedMonth}月{selectedDay}日
            </span>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="flex bg-white rounded-lg p-1 mb-4 shadow-sm">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'main'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            主日期查询
          </button>

          <button
            onClick={() => setActiveTab('classified')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'classified'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            生日介绍
          </button>
        </div>

        {/* 结果展示 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">加载中...</p>
            </div>
          ) : activeTab === 'main' ? (
            result ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">匹配结果</h3>
                  <p className="text-sm text-gray-600">共找到 {Object.values(result.匹配).flat().length} 个匹配关系</p>
                </div>
                
                {renderMatchList(result.匹配.灵魂伴侣, '⭐ 灵魂伴侣', 'bg-yellow-400')}
                {renderMatchList(result.匹配.竞争对手天敌, '🎯 竞争对手天敌', 'bg-red-400')}
                {renderMatchList(result.匹配.情人伴侣, '❤️ 情人伴侣', 'bg-pink-400')}
                {renderMatchList(result.匹配.工作伙伴朋友, '👥 工作伙伴朋友', 'bg-blue-400')}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">未找到匹配结果</p>
              </div>
            )

          ) : activeTab === 'classified' ? (
            birthdayClassified ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">分类介绍</h3>
                  <p className="text-sm text-gray-600">{birthdayClassified.date}</p>
                </div>
                
                {birthdayClassified.found ? (
                  <div className="space-y-4">
                    {birthdayClassified.data.kernel && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">内核</h4>
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {processKernelContent(birthdayClassified.data.kernel).firstThreeLines}
                        </div>
                      </div>
                    )}
                    
                    {birthdayClassified.data.love_marriage && (
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-200">
                        <h4 className="font-semibold text-pink-800 mb-2">恋爱与婚姻</h4>
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {birthdayClassified.data.love_marriage}
                        </div>
                      </div>
                    )}
                    
                    {(birthdayClassified.data.personality || (birthdayClassified.data.kernel && processKernelContent(birthdayClassified.data.kernel).remainingLines)) && (
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">个性特征</h4>
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {(() => {
                            const { remainingLines } = birthdayClassified.data.kernel ? processKernelContent(birthdayClassified.data.kernel) : { remainingLines: '' }
                            return birthdayClassified.data.personality && remainingLines 
                              ? `${birthdayClassified.data.personality}\n\n${remainingLines}`
                              : birthdayClassified.data.personality || remainingLines
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {birthdayClassified.data.work_finance && (() => {
                      const processedWorkFinance = processWorkFinanceContent(birthdayClassified.data.work_finance)
                      
                      return processedWorkFinance && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">工作与财运</h4>
                          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {processedWorkFinance}
                          </div>
                        </div>
                      )
                    })()}
                    
                    {birthdayClassified.data.path_to_self && (
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">成为自己的捷径</h4>
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {birthdayClassified.data.path_to_self}
                        </div>
                      </div>
                    )}
                    
                    {birthdayClassified.data.future_self && (
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                        <h4 className="font-semibold text-indigo-800 mb-2">未来的你</h4>
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {birthdayClassified.data.future_self}
                        </div>
                      </div>
                    )}
                    
                    {birthdayClassified.data.past_self && (() => {
                      const processedPastSelf = processPastSelfContent(birthdayClassified.data.past_self)
                      return processedPastSelf && (
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-2">过去的你</h4>
                          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {processedPastSelf}
                          </div>
                        </div>
                      )
                    })()}
                    
                    {birthdayClassified.data.work_finance && (() => {
                      const celebrities = extractBirthdayCelebrities(birthdayClassified.data.work_finance)
                      return celebrities && (
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                          <h4 className="font-semibold text-teal-800 mb-2">生日名人</h4>
                          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {celebrities}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">暂无该生日的分类介绍信息</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">加载分类介绍中...</p>
              </div>
            )
          ) : null}
        </div>
      </div>

      {/* AI聊天区域 */}
      <div id="ai-chat-section" className="mt-6 sm:mt-8">
        <AIChatSection birthdayData={{
          date: `${selectedMonth}月${selectedDay}日`,
          month: selectedMonth,
          day: selectedDay
        }} />
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
} 
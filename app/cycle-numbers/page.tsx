'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, Users, Target, Star, ArrowLeft } from 'lucide-react';

interface CycleNumber {
  number: string;
  meaning: string;
  description: string;
  key_points: string[];
  life_aspects: {
    love_marriage: string;
    work_finance: string;
    health_life: string;
  };
}

interface CycleNumbersData {
  [key: string]: CycleNumber;
}

export default function CycleNumbersPage() {
  const [cycleNumbers, setCycleNumbers] = useState<CycleNumbersData>({});
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCycleNumbers();
  }, []);

  const fetchCycleNumbers = async () => {
    try {
      const response = await fetch('/api/cycle-numbers');
      const data = await response.json();
      setCycleNumbers(data);
    } catch (error) {
      console.error('Error fetching cycle numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCycleIcon = (number: string) => {
    switch (number) {
      case '1': return '🚀';
      case '2': return '🤝';
      case '3': return '🎨';
      case '4': return '🏠';
      case '5': return '🔄';
      case '6': return '💕';
      case '7': return '🧘';
      case '8': return '💰';
      case '9': return '🎯';
      case '11': return '⚡';
      case '22': return '🌊';
      case '33': return '🔥';
      default: return '✨';
    }
  };

  const getCycleColor = (number: string) => {
    switch (number) {
      case '1': return 'from-blue-500 to-cyan-500';
      case '2': return 'from-green-500 to-emerald-500';
      case '3': return 'from-purple-500 to-pink-500';
      case '4': return 'from-gray-500 to-slate-500';
      case '5': return 'from-orange-500 to-red-500';
      case '6': return 'from-pink-500 to-rose-500';
      case '7': return 'from-indigo-500 to-blue-500';
      case '8': return 'from-yellow-500 to-orange-500';
      case '9': return 'from-violet-500 to-purple-500';
      case '11': return 'from-cyan-500 to-blue-500';
      case '22': return 'from-red-500 to-pink-500';
      case '33': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const filteredCycles = Object.entries(cycleNumbers)
    .filter(([key, cycle]) => 
      key.startsWith('cycle_') && 
      (cycle.number.includes(searchTerm) || 
       cycle.meaning.includes(searchTerm) ||
       cycle.description.includes(searchTerm))
    )
    .sort(([, a], [, b]) => parseInt(a.number) - parseInt(b.number));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (selectedCycle) {
    const cycle = cycleNumbers[selectedCycle];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* 返回按钮 */}
          <button
            onClick={() => setSelectedCycle(null)}
            className="flex items-center text-white mb-6 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回循环数列表
          </button>

          {/* 循环数详情 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">{getCycleIcon(cycle.number)}</span>
              <div>
                <h1 className="text-3xl font-bold text-white">循环数 {cycle.number}</h1>
                {cycle.meaning && (
                  <p className="text-xl text-cyan-400 font-semibold">「{cycle.meaning}」</p>
                )}
              </div>
            </div>

            {cycle.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">描述</h2>
                <p className="text-gray-300 leading-relaxed">{cycle.description}</p>
              </div>
            )}

            {cycle.key_points.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">关键要点</h2>
                <ul className="space-y-2">
                  {cycle.key_points.map((point, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 生活方面 */}
            <div className="grid md:grid-cols-3 gap-4">
              {cycle.life_aspects.love_marriage && (
                <div className="bg-pink-500/20 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Heart className="w-5 h-5 text-pink-400 mr-2" />
                    <h3 className="font-semibold text-white">恋爱·婚姻</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{cycle.life_aspects.love_marriage}</p>
                </div>
              )}

              {cycle.life_aspects.work_finance && (
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-blue-400 mr-2" />
                    <h3 className="font-semibold text-white">工作·财运</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{cycle.life_aspects.work_finance}</p>
                </div>
              )}

              {cycle.life_aspects.health_life && (
                <div className="bg-green-500/20 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-green-400 mr-2" />
                    <h3 className="font-semibold text-white">健康·生活</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{cycle.life_aspects.health_life}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">循环数查询</h1>
          <p className="text-gray-300 text-lg">了解生命灵数中循环数的意义和影响</p>
        </div>

        {/* 搜索框 */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索循环数..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* 循环数网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCycles.map(([key, cycle]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCycle(key)}
              className={`bg-gradient-to-br ${getCycleColor(cycle.number)} p-6 rounded-2xl cursor-pointer backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all duration-300`}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{getCycleIcon(cycle.number)}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white">循环数 {cycle.number}</h3>
                  {cycle.meaning && (
                    <p className="text-cyan-200 font-semibold">「{cycle.meaning}」</p>
                  )}
                </div>
              </div>

              {cycle.description && (
                <p className="text-white/90 text-sm line-clamp-3">
                  {cycle.description.substring(0, 150)}...
                </p>
              )}

              <div className="mt-4 flex items-center text-white/80 text-sm">
                <Star className="w-4 h-4 mr-1" />
                {cycle.key_points.length} 个关键要点
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCycles.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            没有找到匹配的循环数
          </div>
        )}
      </motion.div>
    </div>
  );
} 
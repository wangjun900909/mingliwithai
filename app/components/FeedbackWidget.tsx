'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';

interface FeedbackWidgetProps {
  messageId: string;
  onFeedback?: (type: 'positive' | 'negative', comment?: string) => void;
}

export default function FeedbackWidget({ messageId, onFeedback }: FeedbackWidgetProps) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedbackType(type);
    onFeedback?.(type);
    
    // 如果是负面反馈，显示评论框
    if (type === 'negative') {
      setShowComment(true);
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      onFeedback?.(feedbackType!, comment);
      setComment('');
      setShowComment(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">这个回答对你有帮助吗？</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleFeedback('positive')}
            className={`p-2 rounded-lg transition-colors ${
              feedbackType === 'positive'
                ? 'bg-green-100 text-green-600'
                : 'bg-white text-gray-600 hover:bg-green-50'
            }`}
            title="有帮助"
          >
            <ThumbsUp size={16} />
          </button>
          <button
            onClick={() => handleFeedback('negative')}
            className={`p-2 rounded-lg transition-colors ${
              feedbackType === 'negative'
                ? 'bg-red-100 text-red-600'
                : 'bg-white text-gray-600 hover:bg-red-50'
            }`}
            title="没帮助"
          >
            <ThumbsDown size={16} />
          </button>
        </div>
      </div>

      {showComment && (
        <div className="mt-3 p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">请告诉我们如何改进</span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="请详细描述你的建议..."
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmitComment}
              disabled={!comment.trim()}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              提交反馈
            </button>
          </div>
        </div>
      )}

      {feedbackType && !showComment && (
        <div className="text-sm text-gray-600">
          {feedbackType === 'positive' ? '✅ 感谢你的反馈！' : '📝 我们正在改进中...'}
        </div>
      )}
    </div>
  );
} 
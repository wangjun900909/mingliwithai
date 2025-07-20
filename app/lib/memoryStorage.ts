// 共享的内存存储
export const memoryStorage = new Map();

// 用户信息接口
export interface UserData {
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
// 共享的内存存储
const memoryStorageMap = new Map();

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

// 内存存储类
export const memoryStorage = {
  // 获取用户数据
  get: (username: string): UserData | undefined => {
    return memoryStorageMap.get(username);
  },
  
  // 设置用户数据
  set: (username: string, data: UserData): void => {
    memoryStorageMap.set(username, data);
  },
  
  // 检查用户是否存在
  has: (username: string): boolean => {
    return memoryStorageMap.has(username);
  },
  
  // 删除用户数据
  delete: (username: string): boolean => {
    return memoryStorageMap.delete(username);
  },
  
  // 获取所有用户
  getAll: (): UserData[] => {
    return Array.from(memoryStorageMap.values());
  },
  
  // 清空所有数据
  clear: (): void => {
    memoryStorageMap.clear();
  }
}; 
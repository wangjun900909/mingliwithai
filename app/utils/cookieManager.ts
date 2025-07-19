// Cookie管理工具

export interface UserInfo {
  mbti: string;
  gender: string;
  profession: string;
  status: string;
  age: string;
  maritalStatus: string;
  hasChildren: string;
}

export class CookieManager {
  // 保存用户信息到cookie
  static saveUserInfo(userInfo: UserInfo, days: number = 30): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    
    const cookieValue = JSON.stringify(userInfo);
    document.cookie = `userInfo=${cookieValue}; expires=${expires.toUTCString()}; path=/`;
  }

  // 从cookie获取用户信息
  static getUserInfo(): UserInfo | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; userInfo=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      if (cookieValue) {
        try {
          return JSON.parse(cookieValue);
        } catch (e) {
          console.error('解析cookie失败:', e);
          return null;
        }
      }
    }
    return null;
  }

  // 清除用户信息cookie
  static clearUserInfo(): void {
    document.cookie = 'userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  }

  // 检查是否有保存的用户信息
  static hasUserInfo(): boolean {
    return this.getUserInfo() !== null;
  }

  // 获取特定字段的值
  static getField(field: keyof UserInfo): string {
    const userInfo = this.getUserInfo();
    return userInfo?.[field] || '';
  }

  // 更新特定字段
  static updateField(field: keyof UserInfo, value: string): void {
    const userInfo = this.getUserInfo() || {
      mbti: '',
      gender: '',
      profession: '',
      status: '',
      age: '',
      maritalStatus: '',
      hasChildren: ''
    };
    
    userInfo[field] = value;
    this.saveUserInfo(userInfo);
  }
} 
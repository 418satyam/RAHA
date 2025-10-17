import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }

  static async setLanguage(language: string): Promise<void> {
    await this.setItem('selectedLanguage', language);
  }

  static async getLanguage(): Promise<string | null> {
    return await this.getItem('selectedLanguage');
  }

  static async setUser(user: any): Promise<void> {
    await this.setItem('currentUser', JSON.stringify(user));
  }

  static async getUser(): Promise<any | null> {
    const userStr = await this.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  static async clearUser(): Promise<void> {
    await this.removeItem('currentUser');
  }
}
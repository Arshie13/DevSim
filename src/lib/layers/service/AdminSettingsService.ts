import { UserDataAccess } from "../data-access/UserDataAccess";
import { AppSettingsDataAccess } from "../data-access/AppSettingsDataAccess";
import type { SettingValue } from "../data-access/AppSettingsDataAccess";

export class AdminSettingsService {
  async getAllAppSettings() {
    const appSettingsDataAccess = new AppSettingsDataAccess();
    const settings = await appSettingsDataAccess.getAllAppSettings();

    return {
      data: settings,
      status: 200
    };
  }

  async setAppSetting(userId: string, key: string, value: SettingValue) {
    try {
      const userDataAccess = new UserDataAccess();
      const isAdmin = await userDataAccess.isAdmin(userId);
  
      if (!isAdmin) {
        return {
          error: 'Unauthorized',
          status: 403
        };
      }
  
      if (!key || value === undefined) {
        return {
          error: 'Missing required fields: key, value',
          status: 400
        }
      }
  
      const appSettingsDataAccess = new AppSettingsDataAccess();
      await appSettingsDataAccess.setAppSetting(key, value);
  
      return {
        status: 200
      };
    } catch (error) {
      console.error('Error updating app setting:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update setting',
      };
    }
  }
}
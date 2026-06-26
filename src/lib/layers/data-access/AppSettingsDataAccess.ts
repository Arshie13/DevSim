import prisma from "$lib/server/client";

export type SettingValue = boolean | string | number | Record<string, unknown>;
const DEFAULT_SETTINGS: Record<string, { value: SettingValue; type: string }> = {
  mastery_checkpoint_enabled: { value: true, type: 'boolean' },
  sandbox_enabled: { value: false, type: 'boolean' }
};

function parseValue(value: string, type: string): SettingValue {
  switch (type) {
    case 'boolean':
      return value === 'true';
    case 'number':
      return Number(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

export class AppSettingsDataAccess {
  async getAllAppSettings(): Promise<Record<string, SettingValue>> {
    const settings = await prisma.app_setting.findMany();
    const result: Record<string, SettingValue> = {};

    for (const defKey of Object.keys(DEFAULT_SETTINGS)) {
      const dbSetting = settings.find(s => s.key === defKey);
      if (dbSetting) {
        result[defKey] = parseValue(dbSetting.value, dbSetting.type);
      } else {
        result[defKey] = DEFAULT_SETTINGS[defKey].value;
      }
    }

    return result;
  }

  async setAppSetting(key: string, value: SettingValue): Promise<void> {
    const def = DEFAULT_SETTINGS[key];
    if (!def) {
      throw new Error(`Unknown setting key: ${key}`);
    }

    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const type = def.type;

    await prisma.app_setting.upsert({
      where: { key },
      update: { value: stringValue, type, updated_at: new Date() },
      create: { key, value: stringValue, type }
    });
  }
}
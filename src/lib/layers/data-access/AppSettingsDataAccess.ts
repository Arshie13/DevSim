import prisma from "$lib/server/client";

export type SettingValue = boolean | string | number | number[] | Record<string, unknown>;
const DEFAULT_SETTINGS: Record<string, { value: SettingValue; type: string }> = {
  mastery_checkpoint_enabled: { value: true, type: 'boolean' },
  learner_pass_price: { value: 999, type: 'number' },
  learner_pass_duration_days: { value: 30, type: 'number' },
  learner_pass_special_unlock_days: { value: [6, 12, 18, 24, 30], type: 'json' },
  learner_pass_day_to_scenario: {
    value: { "6": "pern-pos-scenario-3", "12": "mern-tw-scenario-3", "18": "nestjs-pos-scenario-3", "24": "nextjs-postgres-prisma-3", "30": "nextjs-shadcn-ui-scenario-3" },
    type: 'json'
  },
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
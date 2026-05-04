import prisma from '$lib/server/client';

export type SettingValue = boolean | string | number | Record<string, unknown>;

const DEFAULT_SETTINGS: Record<string, { value: SettingValue; type: string }> = {
  mastery_checkpoint_enabled: { value: true, type: 'boolean' }
};

/**
 * Get an application setting by key.
 * Returns the default if the setting doesn't exist in the database.
 */
export async function getAppSetting(key: string): Promise<SettingValue | null> {
  const setting = await prisma.app_setting.findUnique({
    where: { key }
  });

  if (setting) {
    return parseValue(setting.value, setting.type);
  }

  const def = DEFAULT_SETTINGS[key];
  return def ? def.value : null;
}

/**
 * Get all application settings as a record.
 * Always includes default values for known settings.
 */
export async function getAllAppSettings(): Promise<Record<string, SettingValue>> {
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

/**
 * Set an application setting.
 */
export async function setAppSetting(key: string, value: SettingValue): Promise<void> {
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

/**
 * Parse a stored string value back to its typed value.
 */
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

/**
 * Initialize default settings in the database if they don't exist.
 */
export async function seedDefaultSettings(): Promise<void> {
  const promises = Object.entries(DEFAULT_SETTINGS).map(([key, { value, type }]) => {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return prisma.app_setting.upsert({
      where: { key },
      update: {},
      create: { key, value: stringValue, type }
    });
  });

  await Promise.all(promises);
}

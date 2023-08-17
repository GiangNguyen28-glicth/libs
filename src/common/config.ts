export { ConfigModule } from '@nestjs/config';
import { ConfigService as JsConfigService } from '@nestjs/config';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import { pick, snakeCase, set, get } from 'lodash';

import { ENV } from './enum';
import { flattenKeys } from '@libs/utils';

export class ConfigService extends JsConfigService {}
const YAML_CONFIG_FILENAME = 'config.yml';
const PACKAGE_CONFIG_FILENAME = 'package.json';

export class AppConfig {
  name: string;
  description?: string;
  version: string;
  isProd: boolean;
  env: ENV;
}

export const config = async (): Promise<AppConfig> => {
  const env: ENV = (process.env['NODE_ENV'] ?? ENV.DEV) as ENV;
  const appCfg = safeLoad(readFileSync(YAML_CONFIG_FILENAME, 'utf8')) as object;
  const paths = flattenKeys(appCfg, null);
  for (const path of paths) {
    const envKey = snakeCase(path).toUpperCase();
    set(appCfg, path, process.env[envKey] ?? get(appCfg, path));
  }
  const pkg = JSON.parse(readFileSync(PACKAGE_CONFIG_FILENAME, 'utf8'));
  const pkgCfg = pick(pkg, ['name', 'description', 'version']);

  return {
    env,
    isProd: env === ENV.PROD,
    ...appCfg,
    ...pkgCfg,
  };
};

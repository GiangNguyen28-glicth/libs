import { Inject, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { ConfigService } from '@nestjs/config';

import { Client } from './client';
import { ClientConfig, DEFAULT_CON_ID } from './client.config';
import { toArray } from '@libs/utils';

export abstract class AbstractClientService<
  Config extends ClientConfig,
  C = any,
> implements Client<Config, C>, OnModuleInit, OnModuleDestroy
{
  private configs: { [conId: string]: Config } = {};
  private clients: { [conId: string]: C } = {};
  @Inject()
  protected configService: ConfigService;

  @Inject()
  private logService: Logger;

  protected constructor(
    protected service: string,
    protected configClass: new (props: Config) => Config,
  ) {}

  async onModuleInit(): Promise<void> {
    const config = this.configService.get(this.service);
    if (isEmpty(config))
      console.warn('%s service not found config!', this.service);
    const configKeys = Object.keys(config);
    if (configKeys.find((key) => key === 'default')) {
      // If have default object, then use it as default config
      for (const configKey of configKeys) {
        await this.clientInit({ conId: configKey, ...config[configKey] });
      }
    } else {
      // array of config if no default object
      for (const cfg of toArray(config)) await this.clientInit(cfg);
    }
  }

  protected async clientInit(config: Config, first = true) {
    const { conId = DEFAULT_CON_ID } = config;
    const beginMessage = first ? 'initializing...' : 're-initializing...';
    const endMessage = first ? 'initialized' : 're-initialized';

    this.configs[conId] = this.validateConfig(config);

    this.logService.debug('`%s` %s is %s', conId, this.service, beginMessage);
    this.clients[conId] = await this.init(this.configs[conId]);
    this.logService.debug(
      '`%s` %s %s with config:\n%j',
      conId,
      this.service,
      endMessage,
      this.configs[conId],
    );

    await this.start(this.clients[conId], conId);
  }

  private validateConfig(config: Config): Config {
    const cfg = new this.configClass(config);

    const error = cfg.validate();
    if (error?.length) {
      this.logService.error(error, `${this.service} invalid config`);
      throw new Error('Invalid Config');
    }

    return cfg;
  }

  onModuleDestroy() {
    Object.values(this.clients).forEach((client) => this.stop(client));
  }

  getConfig(conId = DEFAULT_CON_ID): Config {
    return this.configs[conId];
  }

  getClient(conId = DEFAULT_CON_ID): C {
    return this.clients[conId];
  }

  protected abstract init(config: Config): Promise<C>;

  protected abstract stop(client: C, conId?: string): Promise<void>;

  protected abstract start(client: C, conId?: string): Promise<void>;
}

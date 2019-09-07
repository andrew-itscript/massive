import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { MassiveService } from './massive.service';
import {
  MASSIVE_CONNECT_OPTIONS,
  MASSIVE_CONFIG_OPTIONS,
  MASSIVE_DRIVER_OPTIONS,
  MASSIVE_CONNECTION,
} from './constants';
import {
  MassiveConnectOptions,
  MassiveConnectAsyncOptions,
  MassiveOptionsFactory,
  MassiveConfigOptions,
  MassiveConfigAsyncOptions,
  MassiveDriverOptions,
  MassiveDriverAsyncOptions,
} from './interfaces';

export const connectionFactory = {
  provide: MASSIVE_CONNECTION,
  useFactory: async massiveService => {
    return massiveService.connect();
  },
  inject: [MassiveService],
};

@Global()
@Module({
  providers: [MassiveService],
  exports: [MassiveService, connectionFactory],
})
export class MassiveModule {
  /**
   * Registers a configured @nestjsplus/massive Module for import into the current module
   * using static connectOptions and configOptions (optional) objects
   */
  public static register(
    connectOptions: MassiveConnectOptions,
    configOptions?: MassiveConfigOptions,
    driverOptions?: MassiveDriverOptions,
  ): DynamicModule {
    return {
      module: MassiveModule,
      providers: [
        {
          provide: MASSIVE_CONNECT_OPTIONS,
          useValue: connectOptions,
        },
        {
          provide: MASSIVE_CONFIG_OPTIONS,
          useValue: configOptions || {},
        },
        {
          provide: MASSIVE_DRIVER_OPTIONS,
          useValue: driverOptions || {},
        },
        connectionFactory,
      ],
    };
  }

  /**
   * Registers a configured @nestjsplus/massive Module for import into the current module
   * using dynamic options (factory, etc)
   */
  public static registerAsync(
    connectOptions: MassiveConnectAsyncOptions,
    configOptions?: MassiveConfigAsyncOptions,
    driverOptions?: MassiveDriverAsyncOptions,
  ): DynamicModule {
    return {
      module: MassiveModule,
      imports: connectOptions.imports || [],
      providers: [
        this.createConnectAsyncProviders(connectOptions),
        this.createConfigAsyncProviders(configOptions),
        this.createDriverAsyncProviders(driverOptions),
        connectionFactory,
      ],
    };
  }

  private static createConnectAsyncProviders(
    options: MassiveConnectAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MASSIVE_CONNECT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: MASSIVE_CONNECT_OPTIONS,
      useFactory: async (optionsFactory: MassiveOptionsFactory) => {
        return optionsFactory.createMassiveConnectOptions();
      },
      inject: [options.useExisting],
    };
  }

  private static createConfigAsyncProviders(
    options: MassiveConfigAsyncOptions,
  ): Provider {
    if (options) {
      if (options.useFactory) {
        return {
          provide: MASSIVE_CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        };
      } else {
        return {
          provide: MASSIVE_CONFIG_OPTIONS,
          useFactory: async (optionsFactory: MassiveOptionsFactory) => {
            return optionsFactory.createMassiveConfigOptions();
          },
          inject: [options.useExisting],
        };
      }
    } else {
      return {
        provide: MASSIVE_CONFIG_OPTIONS,
        useValue: {},
      };
    }
  }

  private static createDriverAsyncProviders(
    options: MassiveDriverAsyncOptions,
  ): Provider {
    if (options) {
      if (options.useFactory) {
        return {
          provide: MASSIVE_DRIVER_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        };
      } else {
        return {
          provide: MASSIVE_DRIVER_OPTIONS,
          useFactory: async (optionsFactory: MassiveOptionsFactory) => {
            return optionsFactory.createMassiveDriverOptions();
          },
          inject: [options.useExisting],
        };
      }
    } else {
      return {
        provide: MASSIVE_DRIVER_OPTIONS,
        useValue: {},
      };
    }
  }
}

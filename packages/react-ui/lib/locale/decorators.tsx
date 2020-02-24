import React from 'react';

import { defaultLangCode } from './constants';
import { LocaleContext } from './LocaleContext';
import { LocaleHelper } from './LocaleHelper';
import { LangCodes, LocaleControls } from './types';

export function locale<C>(controlName: keyof LocaleControls, localeHelper: LocaleHelper<C>) {
  return <T extends new (...args: any[]) => React.Component>(constructor: T) => {
    const LocaleDecorator = class extends constructor {
      public static contextType = LocaleContext;
      public theme: React.ContextType<typeof LocaleContext> = this.context;
      public controlName: keyof LocaleControls = controlName;
      public localeHelper: LocaleHelper<C> = localeHelper;

      public get locale(): C {
        const localeFromContext = this.theme.locale?.[this.controlName];
        return Object.assign({}, this.localeHelper.get(this.theme.langCode), localeFromContext);
      }

      public set locale(l: C) {
        // TODO альтернативная транспиляция декораторов ломает тесты
      }

      public get langCode(): LangCodes {
        return this.theme.langCode ?? defaultLangCode;
      }
    };
    Object.defineProperty(LocaleDecorator, 'name', { value: constructor.name });
    return LocaleDecorator;
  };
}

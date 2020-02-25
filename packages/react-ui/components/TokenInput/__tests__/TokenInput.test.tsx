import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { defaultLangCode } from '../../../lib/locale/constants';
import { LangCodes, LocaleContext, LocaleContextProps } from '../../../lib/locale';
import { delay } from '../../../lib/utils';
import styles from '../../MenuItem/MenuItem.less';
import { TokenInputLocaleHelper } from '../locale';
import { TokenInput, TokenInputType } from '../TokenInput';

async function getItems(query: string) {
  return Promise.resolve(['aaa', 'bbb', 'ccc'].filter(s => s.includes(query)));
}
const generateSelector = (name: keyof typeof styles) => `.${styles[name]}`;

describe('<TokenInput />', () => {
  it('should contains placeholder', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <TokenInput getItems={getItems} selectedItems={[]} onValueChange={onChange} placeholder="Placeholder" />,
    );
    expect(wrapper.find('input').props().placeholder).toBe('Placeholder');
  });

  describe('Locale', () => {
    let wrapper: ReactWrapper;
    const getTextComment = (): string => wrapper.find(generateSelector('comment')).text();
    const focus = async (): Promise<void> => {
      wrapper
        .find(TokenInput)
        .instance()
        .setState({ inFocus: true, inputValue: '--', loading: false });
      await delay(0);
      wrapper.update();
    };
    const contextMount = (props: LocaleContextProps = { langCode: defaultLangCode }, wrappedLocale = true) => {
      const tokeninput = <TokenInput type={TokenInputType.Combined} getItems={getItems} />;
      wrapper =
        wrappedLocale === false ? mount(tokeninput) : mount(<LocaleContext.Provider value={{
          langCode: props.langCode ?? defaultLangCode,
          locale: props.locale,
        }}>{tokeninput}</LocaleContext.Provider>);
    };

    it('render without LocaleProvider', async () => {
      contextMount({ langCode: defaultLangCode }, false);
      const expectedComment = TokenInputLocaleHelper.get(defaultLangCode).addButtonComment;

      await focus();

      expect(getTextComment()).toBe(expectedComment);
    });

    it('render default locale', async () => {
      contextMount();
      const expectedComment = TokenInputLocaleHelper.get(defaultLangCode).addButtonComment;

      await focus();

      expect(getTextComment()).toBe(expectedComment);
    });

    it('render correct locale when set langCode', async () => {
      contextMount({ langCode: LangCodes.en_GB });
      const expectedComment = TokenInputLocaleHelper.get(LangCodes.en_GB).addButtonComment;

      await focus();

      expect(getTextComment()).toBe(expectedComment);
    });

    it('render custom locale', async () => {
      const customComment = 'custom comment';
      contextMount({ locale: { TokenInput: { addButtonComment: customComment } } });

      await focus();

      expect(getTextComment()).toBe(customComment);
    });

    it('updates when langCode changes', async () => {
      contextMount({ langCode: LangCodes.en_GB });
      const expectedComment = TokenInputLocaleHelper.get(LangCodes.ru_RU).addButtonComment;

      await focus();
      wrapper.setProps({ value: { langCode: LangCodes.ru_RU }});

      expect(getTextComment()).toBe(expectedComment);
    });
  });
});

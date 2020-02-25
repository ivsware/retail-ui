import React from 'react';
import PropTypes from 'prop-types';

import { createPropsGetter } from '../internal/createPropsGetter';
import { Override } from '../../typings/utility-types';
import { tabListener } from '../../lib/events/tabListener';
import { cx } from '../../lib/theming/Emotion';
import { Theme } from '../../lib/theming/Theme';
import { ThemeContext } from '../../lib/theming/ThemeContext';

import { jsStyles } from './Link.styles';
import styles from './Link.module.less';

interface UseClasses {
  default: string;
  success: string;
  danger: string;
  grayed: string;
}

function getUseClasses(t: Theme): UseClasses {
  return {
    default: cx(styles.useDefault, jsStyles.useDefault(t)),
    success: cx(styles.useSuccess),
    danger: cx(styles.useDanger),
    grayed: cx(styles.useGrayed, jsStyles.useGrayed(t)),
  };
}

export type LinkProps = Override<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  {
    /** Неактивное состояние */
    disabled?: boolean;
    /** href */
    href?: string;
    /** Иконка */
    icon?: React.ReactElement<any>;
    /** Тип */
    use?: 'default' | 'success' | 'danger' | 'grayed';
    _button?: boolean;
    _buttonOpened?: boolean;
    tabIndex?: number;
    /** onClick */
    onClick?: (event?: React.MouseEvent<HTMLAnchorElement>) => void;
  }
>;

export interface LinkState {
  focusedByTab: boolean;
}

/**
 * Стандартная ссылка.
 * Интерфес пропсов наследуется от `React.AnchorHTMLAttributes<HTMLAnchorElement>`.
 * Все свойства передаются в элемент `<a>`.
 * `className` и `style` не поддерживаются
 */
export class Link extends React.Component<LinkProps, LinkState> {
  public static __KONTUR_REACT_UI__ = 'Link';

  public static propTypes = {
    disabled: PropTypes.bool,

    href: PropTypes.string,

    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

    use: PropTypes.oneOf(['default', 'success', 'danger', 'grayed']),
  };

  public static defaultProps = {
    href: '',
    use: 'default',
  };

  public state = {
    focusedByTab: false,
  };

  private theme!: Theme;
  private getProps = createPropsGetter(Link.defaultProps);

  public render(): JSX.Element {
    return (
      <ThemeContext.Consumer>
        {theme => {
          this.theme = theme;
          return this.renderMain();
        }}
      </ThemeContext.Consumer>
    );
  }

  private renderMain() {
    const { disabled, href, icon, use, _button, _buttonOpened, className, style, ...rest } = this.getProps<
      LinkProps,
      Link
    >();

    let iconElement = null;
    if (icon) {
      iconElement = <span className={styles.icon}>{icon}</span>;
    }

    let arrow = null;
    if (_button) {
      arrow = <span className={styles.arrow} />;
    }

    const props = {
      className: cx({
        [styles.disabled]: !!disabled,
        [jsStyles.disabled(this.theme)]: !!disabled,
        [styles.button]: !!_button,
        [styles.buttonOpened]: !!_buttonOpened,
        [jsStyles.focus(this.theme)]: !disabled && this.state.focusedByTab,
        [getUseClasses(this.theme)[use]]: !!use,
      }),
      href,
      onClick: this._handleClick,
      onFocus: this._handleFocus,
      onBlur: this._handleBlur,
      tabIndex: this.props.tabIndex,
    };
    if (disabled) {
      props.tabIndex = -1;
    }

    return (
      <a {...rest} {...props}>
        {iconElement}
        {this.props.children}
        {arrow}
      </a>
    );
  }

  private _handleFocus = (event: React.FocusEvent<HTMLAnchorElement>) => {
    if (!this.props.disabled) {
      // focus event fires before keyDown eventlistener
      // so we should check tabPressed in async way
      process.nextTick(() => {
        if (tabListener.isTabPressed) {
          this.setState({ focusedByTab: true });
        }
      });
    }
  };

  private _handleBlur = () => {
    this.setState({ focusedByTab: false });
  };

  private _handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const { href, onClick, disabled } = this.props;
    if (!href) {
      event.preventDefault();
    }
    if (onClick && !disabled) {
      onClick(event);
    }
  };
}

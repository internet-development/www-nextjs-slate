import styles from '@nextjs-slate/components/ButtonAction.module.css';

import * as React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  target?: string;
  active?: boolean;
  tabIndex?: number;
  'aria-label'?: string;
};
type LinkButtonProps = {
  children: React.ReactNode;
  href: string;
  target?: string;
  active?: boolean;
  tabIndex?: number;
  'aria-label'?: string;
};

type Props = ButtonProps | LinkButtonProps;
export default function ButtonAction(props: Props) {
  const useLink = 'href' in props;

  if (useLink) {
    return <ButtonAsLinkElement {...props} />;
  }
  return <ButtonAsButtonElement {...props} />;
}

const ButtonAsLinkElement = ({ children, active, href, target, ...rest }: LinkButtonProps) => {
  return (
    <a className={styles.button} style={active ? { color: `var(--color-background)`, background: 'var(--color-button-active)', border: `1px solid var(--color-button-active)` } : null} href={href} target={target} {...rest}>
      {children}
    </a>
  );
};

const ButtonAsButtonElement = ({ active, onClick, children, ...rest }: ButtonProps) => {
  return (
    <button className={styles.button} style={active ? { color: `var(--color-background)`, background: 'var(--color-button-active)', border: `1px solid var(--color-button-active)` } : null} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

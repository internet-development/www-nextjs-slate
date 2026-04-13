import styles from '@nextjs-slate/components/Pill.module.css';

import * as React from 'react';

export default function Pill(props) {
  return (
    <div className={styles.pill}>
      <div className={styles.left}>{props.icon}</div>
      <div className={styles.right}>{props.children}</div>
    </div>
  );
}

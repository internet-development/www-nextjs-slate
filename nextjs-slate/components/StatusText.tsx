import styles from '@nextjs-slate/components/StatusText.module.css';

import * as React from 'react';

export default function StatusText(props) {
  return <div className={styles.root}>{props.children}</div>;
}

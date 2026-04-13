import styles from '@nextjs-slate/components/DefaultLayout.module.css';

import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

export default function DefaultLayout(props) {
  return (
    <>
      <div className={styles.top}>
        <div className={styles.corner}>{props.logo}</div>
        <div className={styles.remainder}>{props.top}</div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.sidebar}>
          <div className={styles.topbar}>{props.sidebar}</div>
          {props.bottombar ? <div className={styles.bottombar}>{props.bottombar}</div> : null}
        </div>
        <div className={styles.content}>{props.children}</div>
      </div>
    </>
  );
}

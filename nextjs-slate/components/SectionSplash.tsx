import styles from '@nextjs-slate/components/SectionSplash.module.css';

import * as React from 'react';

export default function SectionSplash(props) {
  return (
    <div className={styles.body}>
      <img className={styles.image} src="https://intdev-global.s3.us-west-2.amazonaws.com/public/internet-dev/f9322e25-7015-4a02-82e4-2c6371760b64.png" />
    </div>
  );
}

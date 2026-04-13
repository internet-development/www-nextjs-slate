import styles from '@nextjs-slate/components/PostDescription.module.css';

import * as React from 'react';

import Textarea from '@nextjs-slate/components/Textarea';

export default function PostDescription(props) {
  if (props.readOnly) {
    return (
      <div className={styles.public}>
        <p className={styles.description}>{props.value}</p>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <label className={styles.label} htmlFor="post-description">Description</label>
      <Textarea id="post-description" value={props.value} onChange={(e) => props.onChange(e.target.value)} className={styles.textarea} placeholder="Describe what you're sharing..." />
    </div>
  );
}

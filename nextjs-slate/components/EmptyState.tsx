'use client';

import styles from '@nextjs-slate/components/EmptyState.module.css';
import words from '@nextjs-slate/components/PostElements.module.css';

import * as HTTP from '@nextjs-slate/common/http';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import Button from '@nextjs-slate/components/Button';
import InputWithLabel from '@nextjs-slate/components/InputWithLabel';

export default function EmptyState(props) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>⭠</div>
      <div className={styles.top} />

      <div className={styles.block} style={{ borderTop: 0 }}>
        <div className={styles.content}>
          <h1 className={words.h1}>{props.title}</h1>
          <div className={words.p} style={{ marginTop: `1rem` }}>
            {props.children}
          </div>
        </div>
      </div>
    </section>
  );
}

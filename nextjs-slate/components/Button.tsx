'use client';

import styles from '@nextjs-slate/components/Button.module.css';

import * as React from 'react';

export default function Button(props) {
  if (props.disabled) {
    return (
      <button className={styles.disabled} style={props.style}>
        {props.children}
      </button>
    );
  }

  if (props.href) {
    return (
      <a className={styles.button} id={props.id} href={props.href} target={props.target} style={props.style}>
        {props.children}
      </a>
    );
  }

  return (
    <button className={styles.button} id={props.id} onClick={props.onClick} style={props.style}>
      {props.children}
    </button>
  );
}

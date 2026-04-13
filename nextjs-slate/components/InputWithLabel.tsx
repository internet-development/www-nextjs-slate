import styles from '@nextjs-slate/components/InputWithLabel.module.css';

import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import Input from '@nextjs-slate/components/Input';

export default function InputWithLabel(props) {
  return (
    <div className={styles.group} style={props.style}>
      <label className={styles.label}>{props.label}</label>
      <Input type={props.type} name={props.name} value={props.value} onChange={props.onChange} onKeyPress={props.onKeyPress} />
    </div>
  );
}

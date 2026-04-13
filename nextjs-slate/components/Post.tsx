'use client';

import styles from '@nextjs-slate/components/Post.module.css';

import * as React from 'react';
import * as HTTP from '@nextjs-slate/common/http';
import * as Utilities from '@nextjs-slate/common/utilities';
import * as SlateUtilities from '@nextjs-slate/common/slate';
import * as PostElements from '@nextjs-slate/components/PostElements';

import { Editable, Slate } from 'slate-react';

export default function Post(props) {
  const renderElement = React.useCallback((props) => <PostElements.Element {...props} />, []);
  const renderLeaf = React.useCallback((props) => <PostElements.Leaf {...props} />, []);
  const { initialValue, editor } = props;

  return (
    <div className={styles.body}>
      <Editable autoFocus={props.autoFocus} className={styles.editor} onDOMBeforeInput={props.onDOMBeforeInput} onKeyDown={(e) => props.onKeyDown(e, editor)} placeholder={props.placeholder} readOnly={props.readOnly} renderElement={renderElement} renderLeaf={renderLeaf} spellCheck={props.spellCheck} style={{ outline: 0, border: 0 }} />
    </div>
  );
}

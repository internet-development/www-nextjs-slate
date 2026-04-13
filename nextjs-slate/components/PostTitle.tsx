import styles from '@nextjs-slate/components/PostTitle.module.css';

import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import Textarea from '@nextjs-slate/components/Textarea';

export default function PostTitle(props) {
  if (props.readOnly) {
    return (
      <div className={styles.public}>
        <h1 className={styles.heading}>{props.value}</h1>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <label className={styles.label} htmlFor="post-title">Title</label>
      <Textarea
        id="post-title"
        className={styles.textarea}
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
          props.onSlugChange(Utilities.createSlug(e.target.value));
        }}
        placeholder="Untitled"
      />
      {Utilities.isEmpty(props.slug) ? null : (
        <span className={styles.urlPreview}>
          [Production URL]{' '}
          <a className={styles.link} href={`${Constants.SITE_URL}/${props.username}/${props.slug}`} target="_blank">
            {' '}
            {Constants.SITE_URL}/{props.username}/{props.slug}
          </a>
        </span>
      )}
    </div>
  );
}

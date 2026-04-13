'use client';

import styles from '@nextjs-slate/components/SectionUserSetup.module.css';
import words from '@nextjs-slate/components/PostElements.module.css';

import * as Constants from '@nextjs-slate/common/constants';
import * as HTTP from '@nextjs-slate/common/http';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import Button from '@nextjs-slate/components/Button';
import InputWithLabel from '@nextjs-slate/components/InputWithLabel';

export default function SectionUserInactive(props) {
  return (
    <section className={styles.section}>
      <div className={styles.top} />

      <div className={styles.block} style={{ borderTop: 0 }}>
        <div className={styles.content}>
          <h1 className={words.h1}>{props.username} uses {Constants.PRODUCT_NAME}, but hasn’t shared anything, yet</h1>

          <p className={words.p} style={{ marginTop: `1rem` }}>
            Sharing your writing can be tough, but there’s no pressure to share on {Constants.PRODUCT_NAME}. You can write privately for as long as you want, with safeguards in place to ensure no one
            can access your work unless you decide to share it.
          </p>

          <p className={words.p} style={{ marginTop: `1rem` }}>
            Simplicity in design goes beyond minimalism—it’s about creating space for thought, allowing ideas to breathe. {Constants.PRODUCT_NAME} reduces the unnecessary, embracing the concept of
            vacancy as a canvas for possibilities. This approach honors the balance between form and emptiness, allowing details to emerge and take on significance. Our simple
            layout creates a sense calm and clarity, guiding you toward deeper thinking.
          </p>

          <p className={words.p} style={{ marginTop: `1rem` }}>
            Ready to start writing? It’s free to try, and we highly recommend giving it a go.
          </p>

          <div style={{ marginTop: `1rem` }}>
            <Button href="/">Create an account</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

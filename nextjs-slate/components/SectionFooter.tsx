'use client';

import styles from '@nextjs-slate/components/SectionFooter.module.css';

import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';
import * as HTTP from '@nextjs-slate/common/http';

import Button from '@nextjs-slate/components/Button';
import InputWithLabel from '@nextjs-slate/components/InputWithLabel';

export default function SectionFooter(props) {
  return (
    <div className={styles.full}>
      <div className={styles.body}>
        <p className={styles.p}>
          Your {Constants.PRODUCT_NAME} account works with{' '}
          <a className={styles.link} href="https://users.garden">
            USERS.GARDEN
          </a>{' '}
          and any other{' '}
          <a className={styles.link} href="https://wireframe.internet.dev">
            API.INTERNET.DEV
          </a>{' '}
          services. You get access to many services, not just one.
        </p>
        <p className={styles.p} style={{ marginTop: 24 }}>
          {Constants.PRODUCT_NAME} is still in development. By using {Constants.PRODUCT_NAME} you agree to our{' '}
          <a href={`${Constants.SITE_URL}/wwwjim/intdev-terms-of-service`} className={styles.link} target="_blank">
            Terms of Service
          </a>
          ,{' '}
          <a href={`${Constants.SITE_URL}/wwwjim/intdev-privacy-policy`} className={styles.link} target="_blank">
            Privacy Policy
          </a>
          , and{' '}
          <a href={`${Constants.SITE_URL}/wwwjim/intdev-acceptable-use`} className={styles.link} target="_blank">
            Acceptable Use Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

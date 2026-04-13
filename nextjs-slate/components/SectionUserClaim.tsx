'use client';

import styles from '@nextjs-slate/components/SectionUserSetup.module.css';
import words from '@nextjs-slate/components/PostElements.module.css';

import * as Constants from '@nextjs-slate/common/constants';
import * as HTTP from '@nextjs-slate/common/http';
import * as Icon from '@nextjs-slate/components/Icon';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import Button from '@nextjs-slate/components/Button';
import ButtonAction from '@nextjs-slate/components/ButtonAction';
import Cookies from '@nextjs-slate/modules/cookies';
import DefaultLayout from '@nextjs-slate/components/DefaultLayout';
import InputWithLabel from '@nextjs-slate/components/InputWithLabel';
import Logo from '@nextjs-slate/components/Logo';

const SidebarElements = (props) => {
  return (
    <>
      {props.viewer ? (
        <ButtonAction
          onClick={async () => {
            if (!props.viewer.username) {
              window.location.href = `/${props.viewer.email}`;
              return;
            }

            const cookies = new Cookies(null, { path: '/' });
            const response = await HTTP.createPost({ key: cookies.get(Constants.COOKIE_NAME) });
            if (!response) {
              alert('Something went wrong. Please try again later.');
              return;
            }

            if (response.error) {
              alert('Something went wrong. Please try again later.');
              return;
            }

            window.location.href = `/${props.viewer.username}/-/${response.data.id}`;
          }}
        >
          <Icon.Write height="14px" />
        </ButtonAction>
      ) : null}
      {props.viewer ? (
        <ButtonAction href={props.viewer.username ? `/${props.viewer.username}` : `/${props.viewer.email}`}>
          <Icon.Author height="12px" />
        </ButtonAction>
      ) : null}

      {props.viewer ? (
        <ButtonAction
          onClick={async () => {
            const confirm = window.confirm('Are you sure you want to sign out?');
            if (!confirm) {
              return;
            }

            const cookies = new Cookies(null, { path: '/' });
            cookies.remove(Constants.COOKIE_NAME);
            window.location.href = '/';
          }}
        >
          <Icon.Exit height="12px" />
        </ButtonAction>
      ) : null}
    </>
  );
};

function SectionUserClaim(props) {
  return (
    <section className={styles.section}>
      <div className={styles.top} />

      <div className={styles.block} style={{ borderTop: 0 }}>
        <div className={styles.content}>
          <h1 className={words.h1}>{props.username} has not signed up yet</h1>

          <p className={words.p} style={{ marginTop: `1rem` }}>
            Simplicity in design goes beyond minimalism—it’s about creating space for thought, allowing ideas to breathe. {Constants.PRODUCT_NAME} reduces the unnecessary, embracing the concept of
            vacancy as a canvas for possibilities. This approach honors the balance between form and emptiness, allowing details to emerge and take on significance. Our simple
            layout creates a sense calm and clarity, guiding you toward deeper thinking.
          </p>

          <p className={words.p} style={{ marginTop: `1rem` }}>
            Claim this page by creating an account and start writing with us today. Explore your ideas using one of the simplest writing tools on the web.
          </p>

          <div style={{ marginTop: `1rem` }}>
            <Button href="/">Create an account</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SectionUserClaimWithLayout(props) {
  return (
    <DefaultLayout logo={<Logo />} sidebar={<SidebarElements viewer={props.viewer} />}>
      <SectionUserClaim {...props} />
    </DefaultLayout>
  );
}

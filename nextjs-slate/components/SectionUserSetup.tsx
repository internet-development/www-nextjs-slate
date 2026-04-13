'use client';

import styles from '@nextjs-slate/components/SectionUserSetup.module.css';
import words from '@nextjs-slate/components/PostElements.module.css';

import * as Constants from '@nextjs-slate/common/constants';
import * as HTTP from '@nextjs-slate/common/http';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import Button from '@nextjs-slate/components/Button';
import InputWithLabel from '@nextjs-slate/components/InputWithLabel';

export default function SectionUserSetup(props) {
  const [username, setUsername] = React.useState(props.viewer ? props.viewer.username : 'replace-me');
  const [submitted, setSubmitted] = React.useState(false);

  const isVerified = Number(props.viewer.level) >= 10;

  return (
    <section className={styles.section}>
      <div className={styles.top} />

      <div className={styles.block} style={{ borderTop: 0 }}>
        <div className={styles.content}>
          <h1 className={words.h1}>Welcome</h1>
          <p className={words.p} style={{ marginTop: `1rem` }}>
            You are just a few steps away from being able to use {Constants.PRODUCT_NAME}. You need to verify your e-mail and pick an unique username. You can refresh this page once you are finished.
          </p>
        </div>
      </div>

      {!isVerified ? (
        <div className={styles.block}>
          {submitted ? (
            <div className={styles.content}>
              <h2 className={words.h2} style={{ marginTop: `1rem` }}>
                ➝ Reverification e-mail sent!
              </h2>
              <p className={words.p} style={{ marginTop: `1rem` }}>
                Please check your e-mail or spam folder again for an e-mail from no-reply@mail.internet.dev.
              </p>
            </div>
          ) : (
            <div className={styles.content}>
              <h2 className={words.h2} style={{ marginTop: `1rem` }}>
                Verify your e-mail
              </h2>
              <p className={words.p} style={{ marginTop: `1rem` }}>
                Check your e-mail or spam folder for an e-mail from no-reply@mail.internet.dev.
              </p>

              <div style={{ marginTop: `1rem` }}>
                <Button
                  onClick={async () => {
                    const response = await HTTP.resendEmailVerification();
                    if (!response) {
                      alert('Something went wrong, try again later.');
                      return;
                    }

                    setSubmitted(true);
                    alert('Please check your e-mail for a response');
                  }}
                >
                  Resend verification
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {Utilities.isEmpty(props.viewer.username) ? (
        <div className={styles.block}>
          <div className={styles.content}>
            <h2 className={words.h2} style={{ marginTop: `1rem` }}>
              Pick your username
            </h2>
            <p className={words.p} style={{ marginTop: `1rem` }}>
              Your username will be used for public posts, it must be unique.
            </p>
          </div>
          <InputWithLabel
            label="Username"
            name="username"
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            style={{ borderTop: `1px solid var(--color-border)` }}
            value={username}
          />
          <div className={styles.content}>
            <p className={words.p} style={{ color: `rgba(0, 0, 0, 0.5)` }}>
              We will attempt to make your username: <strong>"{Utilities.createSlug(username)}"</strong>. This will appear on your public posts.
            </p>

            <div style={{ marginTop: `2rem` }}>
              <Button
                onClick={async () => {
                  let candidate = Utilities.createSlug(username);

                  if (Utilities.isEmpty(candidate)) {
                    alert('You pust provide a username');
                    return;
                  }

                  if (candidate.length < 3) {
                    alert('Your username must be at least 2 characters long');
                    return;
                  }

                  const response = await HTTP.setUserUsername({ username: candidate });
                  if (!response) {
                    alert('Something went wrong, try again later.');
                    return;
                  }

                  window.location.replace(`/${candidate}`);
                }}
              >
                Set username
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

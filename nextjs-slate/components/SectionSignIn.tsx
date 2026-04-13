'use client';

import styles from '@nextjs-slate/components/SectionSignIn.module.css';

import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';
import * as HTTP from '@nextjs-slate/common/http';

import ActionItem from '@nextjs-slate/components/ActionItem';
import Button from '@nextjs-slate/components/Button';
import Cookies from '@nextjs-slate/modules/cookies';
import InputWithLabel from '@nextjs-slate/components/InputWithLabel';

import { Apple, Google } from '@nextjs-slate/components/Icon';

const cookie = new Cookies();

export default function SectionSignIn(props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  return (
    <div className={styles.full}>
      <div className={styles.body}>
        <InputWithLabel label="E-mail" name="email" onChange={(e) => setEmail(e.target.value)} type="text" value={email} />
        {!Utilities.isEmpty(email) ? (
          <ActionItem
            icon={`⊹`}
            onClick={async () => {
              const response = await HTTP.handleResetPasswordRequest({ email });

              if (response) {
                alert('Check your e-mail for instructions.');
              } else {
                alert('Something went wrong, try it again.');
              }
            }}
          >
            Forgot your password?
          </ActionItem>
        ) : null}
        <InputWithLabel
          label="Password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const submitButton = document.getElementById('SUBMIT_SIGN_IN_OR_SIGN_UP');

              if (submitButton) {
                submitButton.click();
              }
            }
          }}
          type="password"
          value={password}
        />
        <div className={styles.actions}>
          <Button
            id="SUBMIT_SIGN_IN_OR_SIGN_UP"
            onClick={async () => {
              setLoading(true);
              const response = await HTTP.authenticate({ email, password, source: Constants.SITE_DOMAIN });
              if (!response || response.error) {
                alert('Failed to sign you in (1)');
                setEmail('');
                setPassword('');
                return setLoading(false);
              }

              if (!response.user) {
                alert('Failed to sign you in (2)');
                return setLoading(false);
              }

              if (Utilities.isEmpty(response.user.key)) {
                alert('Failed to sign you in (3)');
                return setLoading(false);
              }

              //NOTE(jimmylee): Cookie based authentication.
              cookie.set(Constants.COOKIE_NAME, response.user.key, { sameSite: 'strict', path: '/' });

              //NOTE(jimmylee): If the user has a username, they are properly setup.
              if (response.user.username) {
                window.location.href = `/${response.user.username}`;
                return;
              }

              //NOTE(jimmylee): app/[username]/page.tsx knows how to handle this case.
              window.location.href = `/${response.user.email}`;
            }}
          >
            {loading ? `⌛` : `Sign in`}
          </Button>
          <Button
            onClick={() => {
              window.location.href = `https://api.internet.dev/authenticate-google?domain=${Constants.OAUTH_REDIRECT_KEY}`;
            }}
          >
            <Google height="16px" style={{ marginRight: 16 }} />
            Sign in with Google
          </Button>
          <Button
            onClick={() => {
              window.location.href = `https://api.internet.dev/authenticate-apple?domain=${Constants.OAUTH_REDIRECT_KEY}`;
            }}
          >
            <Apple height="16px" style={{ marginRight: 16 }} />
            Sign in with Apple
          </Button>
        </div>
        <div className={styles.subFooter}>
          <p className={styles.p}>
            Your{' '}
            <a className={styles.link} href="https://wireframes.internet.dev/examples/features/authentication">
              API.INTERNET.DEV
            </a>{' '}
            account works with {Constants.PRODUCT_NAME} and{' '}
            <a className={styles.link} href="https://users.garden">
              USERS.GARDEN
            </a>
            . Once you verify your e-mail you will be able to use our editor, save your posts, and publish anything you like on the internet.
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
    </div>
  );
}

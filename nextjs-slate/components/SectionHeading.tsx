import styles from '@nextjs-slate/components/SectionHeading.module.css';

import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import Button from '@nextjs-slate/components/Button';
import Tooltip from '@nextjs-slate/components/Tooltip';

export default function SectionHeading(props) {
  if (props.viewer) {
    let presentationName = props.viewer && !Utilities.isEmpty(props.viewer.username) ? props.viewer.username : props.viewer.email;

    const isVerified = Number(props.viewer.level) >= Constants.Users.tiers.VERIFIED;
    const isPaying = Number(props.viewer.level) >= Constants.Users.tiers.PAYING;
    const isOffice = Number(props.viewer.level) >= Constants.Users.tiers.GENERAL_CO_WORKING;
    const isPartner = Number(props.viewer.level) >= Constants.Users.tiers.PARTNER;
    const isAdmin = Number(props.viewer.level) >= Constants.Users.tiers.ADMIN;

    if (Utilities.isEmpty(props.viewer.username)) {
      return (
        <div className={styles.body}>
          <h1 className={styles.heading}>Welcome back {presentationName}!</h1>
          <h2 className={styles.description}>You need to set up your account username.</h2>
          <br />
          <br />
          <Button href={`/${props.viewer.email}`}>Setup</Button>
        </div>
      );
    }

    const tokenCount = props.balance && props.balance.balance !== undefined ? Number(props.balance.balance).toLocaleString() : '0';

    return (
      <div className={styles.body}>
        <h1 className={styles.heading}>Welcome back {presentationName}!</h1>

        <p className={styles.tokens}>
          Your account has <strong style={{ color: `var(--color-primary)` }}>{tokenCount} ▚▚ tokens</strong>. Upgrade to get more and take advantage of everything we have to offer in the future.
        </p>

        <div style={{ marginTop: 24, marginBottom: 48 }}>
          <Button href="https://users.garden">Update account on Users Garden</Button>
        </div>

        <h2 className={styles.description}>⭠ Use the navigation to create a post or view your profile.</h2>

        <ul className={styles.list}>
          <li className={styles.listItem} style={isVerified ? { opacity: 0.1 } : undefined}>
            You are an <strong style={{ color: `var(--color-primary)` }}>unverified user</strong>. You will need to verify your e-mail to use {Constants.PRODUCT_NAME}.
          </li>
          <li className={styles.listItem} style={isPaying ? { opacity: 0.1 } : undefined}>
            You are a <strong style={{ color: `var(--color-primary)` }}>verified user</strong>. You may write up to 20 posts.
          </li>
          <li className={styles.listItem} style={!isPaying ? { opacity: 0.1 } : undefined}>
            You are a <strong style={{ color: `var(--color-primary)` }}>professional user</strong>. You have access to unlimited posts and all of our features.
          </li>
        </ul>

        {!isPaying ? <Button href={'/-/upgrade'}>Upgrade</Button> : <Button href={`/${props.viewer.username}`}>View profile</Button>}
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <h1 className={styles.heading}>The simple writing tool template for building great writing tools.</h1>
    </div>
  );
}

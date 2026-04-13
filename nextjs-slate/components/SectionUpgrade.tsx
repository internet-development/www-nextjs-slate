'use client';

import styles from '@nextjs-slate/components/SectionUpgrade.module.css';
import words from '@nextjs-slate/components/PostElements.module.css';

import * as Constants from '@nextjs-slate/common/constants';
import * as HTTP from '@nextjs-slate/common/http';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import Button from '@nextjs-slate/components/Button';
import InputWithLabel from '@nextjs-slate/components/InputWithLabel';

const H1 = (props) => <h1 className={styles.h1}>{props.children}</h1>;
const P = (props) => <p className={words.p}>{props.children}</p>;
const Text = (props) => <p style={{ fontSize: `1rem` }}>{props.children}</p>;

function Pricing(props) {
  const level = Number(props.viewer.level);
  const isVerified = level >= Constants.Users.tiers.VERIFIED;
  const isPaying = level >= Constants.Users.tiers.PAYING;
  const isOffice = level >= Constants.Users.tiers.GENERAL_CO_WORKING;
  const isPartner = level >= Constants.Users.tiers.PARTNER;
  const isAdmin = level >= Constants.Users.tiers.ADMIN;

  return (
    <div className={styles.root} style={props.style}>
      <div className={styles.row}>
        <div className={styles.column}>
          <div className={styles.content}>
            <div className={styles.pricingHeader}>
              <Text>Basic Usage</Text>
            </div>
            <div className={styles.bottom}>
              <H1>Free</H1>
              <Text style={{ marginBottom: 24 }}>Forever</Text>
              <Button style={{ minHeight: 48, marginTop: 24 }} disabled>
                Already obtained
              </Button>
              <ul className={styles.list}>
                <li className={styles.listItem}>No access to paid APIs</li>
                <li className={styles.listItem}>E-mail verification required</li>
                <li className={styles.listItem}>Allowed up to 20 posts</li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.content}>
            <div className={styles.pricingHeader}>
              <Text>Paid</Text>
            </div>
            <div className={styles.bottom}>
              <H1>$8.99</H1>
              <Text style={{ marginBottom: 24 }}>Per month</Text>
              <Button style={{ minHeight: 48, marginTop: 24 }} disabled={isPaying} href={`https://buy.stripe.com/28og0B2f9eIj8Io9AA?prefilled_email=${props.viewer.email}`}>
                {isPaying ? `Already obntained` : `Upgrade`}
              </Button>
              <ul className={styles.list}>
                <li className={styles.listItem}>1,500 credits renewed monthly</li>
                <li className={styles.listItem}>Access to paid APIs</li>
                <li className={styles.listItem}>Unlimited posts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SectionUpgrade(props) {
  if (!props.viewer) {
    return <div>&nbsp;</div>;
  }

  const level = Number(props.viewer.level);
  const isVerified = level >= Constants.Users.tiers.VERIFIED;
  const isPaying = level >= Constants.Users.tiers.PAYING;
  const isOffice = level >= Constants.Users.tiers.GENERAL_CO_WORKING;
  const isPartner = level >= Constants.Users.tiers.PARTNER;
  const isAdmin = level >= Constants.Users.tiers.ADMIN;

  const userGardenLink = (
    <a className={styles.link} href="https://users.garden">
      USERS.GARDEN
    </a>
  );

  const apiLink = (
    <a className={styles.link} href="https://wireframe.internet.dev">
      API.INTERNET.DEV
    </a>
  );

  return (
    <section className={styles.section}>
      <div className={styles.top} />

      <div className={styles.block} style={{ borderTop: 0 }}>
        <div className={styles.content}>
          <h1 className={words.h1} style={{ marginTop: 48 }}>
            Upgrade your account
          </h1>
          <p className={words.p} style={{ marginTop: `1rem` }}>
            Your {Constants.PRODUCT_NAME} account works seamlessly with {userGardenLink} and any other {apiLink} services, giving you access to a variety of services, not just one. By upgrading your
            account, you’ll not only enhance your {Constants.PRODUCT_NAME} experience with unlimited posts, but you’ll also have the opportunity to explore everything the Internet Development Studio
            offers.
          </p>

          <p className={words.p} style={{ marginTop: `1rem` }}>
            In case you need to cancel your subscription, you can visit {userGardenLink} and cancel it anytime with one click.
          </p>
        </div>
      </div>

      <div className={styles.block}>
        <Pricing viewer={props.viewer} />
      </div>
    </section>
  );
}

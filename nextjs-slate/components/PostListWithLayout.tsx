'use client';

import styles from '@nextjs-slate/components/PostListWithLayout.module.css';

import Button from '@nextjs-slate/components/Button';
import ButtonAction from '@nextjs-slate/components/ButtonAction';
import Cookies from '@nextjs-slate/modules/cookies';
import DefaultLayout from '@nextjs-slate/components/DefaultLayout';
import EmptyState from '@nextjs-slate/components/EmptyState';
import Logo from '@nextjs-slate/components/Logo';
import SectionUserInactive from '@nextjs-slate/components/SectionUserInactive';
import Tooltip from '@nextjs-slate/components/Tooltip';

import * as Constants from '@nextjs-slate/common/constants';
import * as Icon from '@nextjs-slate/components/Icon';
import * as HTTP from '@nextjs-slate/common/http';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

const SidebarElements = (props) => {
  return (
    <>
      {props.isViewer ? (
        <Tooltip tooltipText="Create post" position="right" yOffset="4px">
          <ButtonAction
            onClick={async () => {
              if (!props.viewer.username) {
                window.location.href = `/`;
                return;
              }

              const cookies = new Cookies(null, { path: '/' });
              const postResponse = await HTTP.createPost({ key: cookies.get(Constants.COOKIE_NAME) });
              if (!postResponse) {
                alert('Something went wrong. Please try again.');
                return;
              }

              if (postResponse.error) {
                alert('Something went wrong. Please try again.');
                return;
              }

              window.location.href = `${props.viewer.username}/-/${postResponse.data.id}`;
            }}
          >
            <Icon.Write height="14px" />
          </ButtonAction>
        </Tooltip>
      ) : null}
      {props.isViewer ? (
        <Tooltip tooltipText="Sign out" position="right" yOffset="4px">
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
        </Tooltip>
      ) : null}
    </>
  );
};

export default function PostListWithLayout(props) {
  const [posts, setPosts] = React.useState(props.posts ? props.posts : []);

  let children = null;

  if (props.isViewer) {
    const isVerified = props.level >= Constants.Users.tiers.VERIFIED;
    const isPaying = props.level >= Constants.Users.tiers.PAYING;

    children = (
      <EmptyState title="">
        Click the button on the left to create a post.
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
        {!isPaying ? <Button href={'/-/upgrade'}>Upgrade</Button> : <Button href={`/${props.username}`}>View profile</Button>}
      </EmptyState>
    );
  }

  const isFilledWithPosts = posts && posts.length;
  if (isFilledWithPosts) {
    children = posts.map((each) => {
      const editURL = `/${props.username}/-/${each.id}`;

      let slugURL = null;
      if (!Utilities.isEmpty(each.slug)) {
        slugURL = `/${props.username}/${each.slug}`;
      }

      if (props.isViewer) {
        return (
          <div key={each.id} className={styles.row}>
            <p className={styles.item}>
              Edit{' '}
              <a className={styles.link} href={editURL}>
                📄 {each.id}
              </a>
            </p>

            {!Utilities.isEmpty(each.slug) && each.data.public ? (
              <p className={styles.item}>
                Public ≫{' '}
                <a className={styles.link} href={slugURL} target="_blank">
                  🌎 {each.slug}
                </a>
              </p>
            ) : (
              <p className={styles.item}>Private ≫ 🔓</p>
            )}

            <p className={styles.item}>Created ≫ {Utilities.toDateISOString(each.created_at)}</p>

            <p className={styles.item}>Updated ≫ {Utilities.toDateISOString(each.updated_at)}</p>

            <p className={styles.item}>
              <span
                className={styles.link}
                onClick={async () => {
                  const confirm = window.confirm('Are you sure you want to delete this post?');
                  if (!confirm) {
                    return null;
                  }

                  const cookies = new Cookies(null, { path: '/' });
                  const results = await HTTP.deletePost({ id: each.id, key: cookies.get(Constants.COOKIE_NAME) });
                  if (!results || !results.success) {
                    alert('Failed to delete');
                    return;
                  }

                  const response = await HTTP.getViewerPosts({ key: cookies.get(Constants.COOKIE_NAME), orderBy: { column: 'created_at', value: 'desc' } });
                  setPosts(response ? response : []);
                }}
              >
                × Delete
              </span>
            </p>
          </div>
        );
      }

      return (
        <div key={each.id} className={styles.row}>
          <p className={styles.item}>Created ≫ {Utilities.toDateISOString(each.created_at)}</p>

          <p className={styles.item}>Updated ≫ {Utilities.toDateISOString(each.updated_at)}</p>
          <p className={styles.item}>
            Public URL ≫{' '}
            <a className={styles.link} href={slugURL} target="_blank">
              {Constants.SITE_URL}{slugURL}
            </a>
          </p>
        </div>
      );
    });

    children = <>{children}</>;
  }

  if (!isFilledWithPosts && !props.isViewer) {
    children = <SectionUserInactive username={props.username} />;
  }

  return (
    <DefaultLayout logo={<Logo />} sidebar={<SidebarElements viewer={props.viewer} isViewer={props.isViewer} setPosts={setPosts} />}>
      {children}
    </DefaultLayout>
  );
}

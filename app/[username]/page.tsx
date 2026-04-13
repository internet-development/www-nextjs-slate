import '@root/global.css';

import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Server from '@nextjs-slate/common/server';

import PostListWithLayout from '@nextjs-slate/components/PostListWithLayout';
import SectionUserSetup from '@nextjs-slate/components/SectionUserSetup';
import SectionUserClaim from '@nextjs-slate/components/SectionUserClaim';

import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { username } = await params;

  const title = decodeURIComponent(username);
  const description = `writing by ${username}`;
  const url = `${Constants.SITE_URL}/${username}`;

  return {
    metadataBase: new URL(Constants.SITE_URL),
    title,
    description,
    url,
    openGraph: {
      title,
      description,
      url,
      images: ['https://txtdev.s3.us-west-2.amazonaws.com/txt-dev-preview.png'],
    },
    twitter: {
      title,
      description,
      url,
      handle: '@internetxstudio',
      cardType: 'summary_large_image',
    },
  };
}

export default async function Page(props) {
  const { username } = await props.params;
  const emailOrUsername = decodeURIComponent(username.toLowerCase());
  const list = await headers();
  const { cookie, host, protocol, viewer } = await Server.setup({ headers: list });

  const userFromUsername = await Server.getUserByUsername({ username: emailOrUsername });
  const isViewer = viewer && userFromUsername && userFromUsername.id === viewer.id;
  const isNotVerified = viewer && Number(viewer.level) < Constants.Users.tiers.VERIFIED;

  if (viewer) {
    if (isNotVerified) {
      return <SectionUserSetup isViewer={props.isViewer} viewer={viewer} />;
    }

    if (!viewer.username) {
      return <SectionUserSetup isViewer={props.isViewer} viewer={viewer} />;
    }
  }

  if (!userFromUsername) {
    return <SectionUserClaim viewer={props.viewer} username={emailOrUsername} />;
  }

  let posts = null;
  if (isViewer) {
    posts = await Server.getAllPosts(cookie);
    return <PostListWithLayout username={viewer.username} viewer={viewer} level={viewer.level} isViewer={isViewer} posts={posts} />;
  }

  posts = await Server.getAllPublicPostsByUsername({ username: emailOrUsername });

  return <PostListWithLayout username={emailOrUsername} viewer={viewer} level={viewer ? viewer.level : null} isViewer={isViewer} posts={posts} />;
}

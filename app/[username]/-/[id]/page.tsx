import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import '@root/global.css';

import EditablePostWithLayout from '@nextjs-slate/components/EditablePostWithLayout';

import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Server from '@nextjs-slate/common/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id, username } = await params;
  const title = 'Edit';
  const description = `Edit ${id} by ${username}`;
  const url = `${Constants.SITE_URL}/${username}/-/${id}`;

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
  const { id, username } = await props.params;
  const emailOrUsername = decodeURIComponent(username.toLowerCase());
  const userFromUsername = await Server.getUserByUsername({ username: emailOrUsername });

  const list = await headers();
  const { cookie, host, protocol, viewer, key } = await Server.setup({ headers: list });
  const post = await Server.getPostById({ id, key });
  const isViewer = viewer && userFromUsername && userFromUsername.id === viewer.id;

  //NOTE(jimmylee): Post is not found, so redirect to the username.
  if (!post) {
    redirect(`/${emailOrUsername}`);
  }

  //NOTE(jimmylee): These are edit URLs, so if you're not the viewer, you should not be here.
  if (!isViewer) {
    redirect(`/${emailOrUsername}`);
    return null;
  }

  return <EditablePostWithLayout post={post} username={emailOrUsername} />;
}

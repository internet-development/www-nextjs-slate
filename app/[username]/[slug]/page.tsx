import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import '@root/global.css';

import PostPublicWithLayout from '@nextjs-slate/components/PostPublicWithLayout';

import * as Constants from '@nextjs-slate/common/constants';
import * as Server from '@nextjs-slate/common/server';
import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { username, slug } = await params;
  const { post, user } = await Server.getPostBySlug({ slug });
  const email = decodeURIComponent(username);
  const title = post ? post.data.title : '404';
  const description = post ? Utilities.elide(post.data.description, 155) : 'Not found';
  const url = `${Constants.SITE_URL}/${email}/${slug}`;

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
  const { slug, username } = await props.params;
  const emailOrUsername = decodeURIComponent(username.toLowerCase());
  const userFromUsername = await Server.getUserByUsername({ username: emailOrUsername });

  const list = await headers();
  const { cookie, host, protocol, viewer } = await Server.setup({ headers: list });
  const { post, user } = await Server.getPostBySlug({ slug });
  const isViewer = viewer && userFromUsername && userFromUsername.id === viewer.id;

  //NOTE(jimmylee): We could not retrieve the entity, so there is probably no entity.
  if (!post) {
    redirect(`/${emailOrUsername}`);
    return null;
  }

  //NOTE(jimmylee): Lets check if a real user exists.
  if (!userFromUsername) {
    redirect(`/${emailOrUsername}`);
    return null;
  }

  //NOTE(jimmylee): If there is no user, then lets try to go back to their profile.
  if (!user) {
    redirect(`/${emailOrUsername}`);
    return null;
  }

  //NOTE(jimmylee): This post is no longer public. So redirect to the root.
  if (post.data && !post.data.public) {
    redirect(`/${emailOrUsername}`);
    return null;
  }

  return <PostPublicWithLayout isViewer={isViewer} post={post} user={user} />;
}

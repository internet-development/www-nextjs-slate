import '@root/global.css';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Server from '@nextjs-slate/common/server';

import DefaultLayout from '@nextjs-slate/components/DefaultLayout';
import GeneralSidebar from '@nextjs-slate/components/GeneralSidebar';
import Logo from '@nextjs-slate/components/Logo';
import SectionUpgrade from '@nextjs-slate/components/SectionUpgrade';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const title = `${Constants.PRODUCT_NAME} - Upgrade your account`;
  const description = `Upgrade your account to write more posts on ${Constants.PRODUCT_NAME}`;
  const url = `${Constants.SITE_URL}/-/upgrade`;

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
  const list = headers();
  const { cookie, host, protocol, viewer } = await Server.setup({ headers: list });

  if (!viewer) {
    redirect(`/`);
    return null;
  }

  return (
    <DefaultLayout logo={<Logo />} sidebar={<GeneralSidebar redirectURL={`/${viewer.username}`} viewer={viewer} />}>
      <SectionUpgrade viewer={viewer} />
    </DefaultLayout>
  );
}

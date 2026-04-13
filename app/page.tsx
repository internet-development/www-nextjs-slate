import '@root/global.css';

import DefaultLayout from '@nextjs-slate/components/DefaultLayout';
import GeneralSidebar from '@nextjs-slate/components/GeneralSidebar';
import Logo from '@nextjs-slate/components/Logo';
import SectionFooter from '@nextjs-slate/components/SectionFooter';
import SectionHeading from '@nextjs-slate/components/SectionHeading';
import SectionSignIn from '@nextjs-slate/components/SectionSignIn';
import SectionSplash from '@nextjs-slate/components/SectionSplash';

import * as Constants from '@nextjs-slate/common/constants';
import * as React from 'react';
import * as Server from '@nextjs-slate/common/server';

import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const title = Constants.PRODUCT_NAME;
  const description = 'a writing tool by INTDEV';
  const url = Constants.SITE_URL;

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
  const list = await headers();
  const { cookie, host, protocol, viewer, balance } = await Server.setup({ headers: list });

  return (
    <DefaultLayout logo={<Logo />} sidebar={<GeneralSidebar redirectURL={viewer ? `/${viewer.username}` : '#'} viewer={viewer} />}>
      <SectionHeading viewer={viewer} balance={balance} />
      <SectionSplash />
      {!viewer ? <SectionSignIn /> : <SectionFooter />}
    </DefaultLayout>
  );
}

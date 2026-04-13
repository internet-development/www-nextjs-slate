import * as Constants from '@nextjs-slate/common/constants';

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${Constants.SITE_URL}/sitemap.xml`,
  };
}

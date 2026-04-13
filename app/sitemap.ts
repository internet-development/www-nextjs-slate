import * as Constants from '@nextjs-slate/common/constants';

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: Constants.SITE_URL,
      lastModified: new Date(),
    },
  ];
}

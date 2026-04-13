import * as Constants from '@nextjs-slate/common/constants';
import * as HTTP from '@nextjs-slate/common/http';
import * as Utilities from '@nextjs-slate/common/utilities';

import Cookies from '@nextjs-slate/modules/cookies';
import aesjs from '@nextjs-slate/modules/aes';

//NOTE(jimmylee): Some endpoints on https://api.internet.dev require server-side decryption.
//NOTE(jimmylee): Without it, you won’t be able to perform actions like password recovery or Google authentication.
//NOTE(jimmylee): To enable these features, set API_AES_KEY and API_IV_KEY environment variables.

export function decrypt(hex) {
  if (Utilities.isEmpty(process.env.API_AES_KEY)) {
    throw new Error('process.env.API_AES_KEY');
    return;
  }

  if (Utilities.isEmpty(process.env.API_IV_KEY)) {
    throw new Error('process.env.API_IV_KEY');
    return;
  }

  const aesKey = aesjs.utils.utf8.toBytes(process.env.API_AES_KEY);
  const base64IV = process.env.API_IV_KEY;

  if (!base64IV) {
    throw new Error('process.env.API_IV_KEY is undefined. Please set the environment variable.');
  }

  const ivBytes = aesjs.utils.hex.toBytes(Buffer.from(base64IV, 'base64').toString('hex'));
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(ivBytes));
  const encryptedBytes = aesjs.utils.hex.toBytes(hex);
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);
  const decrypted = aesjs.utils.utf8.fromBytes(decryptedBytes);

  return decrypted;
}

export async function setup({ headers }) {
  const host = headers.get('host');
  const cookie = headers.get('cookie');
  const protocol = headers.get('x-forwarded-proto');
  const cookies = new Cookies(cookie, { path: '/' });
  const key = cookies.get(Constants.COOKIE_NAME);

  let viewer = null;
  let balance = null;
  try {
    viewer = await HTTP.getViewer({ key });
    if (viewer) {
      balance = await HTTP.getBalance({ key });
    }
  } catch (e) {}

  return {
    host,
    cookie,
    protocol,
    viewer,
    balance,
    key,
  };
}

export async function isAuthenticated(cookie) {
  const cookies = new Cookies(cookie, { path: '/' });
  const key = cookies.get(Constants.COOKIE_NAME);

  try {
    return await HTTP.getViewer({ key });
  } catch (e) {
    return null;
  }
}

export async function getAllPosts(cookie) {
  const cookies = new Cookies(cookie, { path: '/' });
  const key = cookies.get(Constants.COOKIE_NAME);

  try {
    return await HTTP.getViewerPosts({ key, orderBy: { column: 'created_at', value: 'desc' } });
  } catch (e) {
    return null;
  }
}

export async function getUserByUsername({ username }) {
  try {
    return await HTTP.getUserByUsername({ username });
  } catch (e) {
    return null;
  }
}

export async function getAllPublicPosts({ email }) {
  try {
    return await HTTP.getPublicPostsByEmail({ email });
  } catch (e) {
    return null;
  }
}

export async function getAllPublicPostsByUsername({ username }) {
  try {
    return await HTTP.getPublicPostsByUsername({ username, orderBy: { column: 'created_at', value: 'desc' } });
  } catch (e) {
    return null;
  }
}

export async function getPostById({ id, key }) {
  try {
    return await HTTP.getPostById({ id, key });
  } catch (e) {
    return null;
  }
}

export async function getPostBySlug({ slug }) {
  let user = null;
  let post = null;
  try {
    const data = await HTTP.getPostBySlug({ slug });
    user = data.user;
    post = data.post;
  } catch (e) {
    return { user: null, post: null };
  }

  return { user, post };
}

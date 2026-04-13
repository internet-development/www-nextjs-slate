import * as Constants from '@nextjs-slate/common/constants';
import * as Utilities from '@nextjs-slate/common/utilities';

import Cookies from '@nextjs-slate/modules/cookies';

const REQUEST_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const API_SITE_ID = Constants.SITE_DOMAIN;

const getHeaders = ({ key }) => {
  return { ...REQUEST_HEADERS, 'X-API-KEY': key };
};

export async function getViewer({ key }) {
  let viewer = null;
  try {
    const response = await fetch('https://api.internet.dev/api/users/viewer', {
      method: 'PUT',
      headers: getHeaders({ key }),
    });
    const result = await response.json();
    if (result && result.viewer) {
      viewer = result.viewer;
    }

    return viewer;
  } catch (e) {
    return null;
  }
}

export async function getUserByUsername({ username }) {
  const response = await fetch('https://api.internet.dev/api/users/public/get-by-username', {
    method: 'POST',
    headers: getHeaders({ key: null }),
    body: JSON.stringify({ username }),
  });

  const json = await response.json();
  if (json && json.data) {
    return json.data;
  }

  return null;
}

export async function setUserUsername({ username }) {
  const cookies = new Cookies(null, { path: '/' });
  const key = cookies.get(Constants.COOKIE_NAME);

  const response = await fetch('https://api.internet.dev/api/users/update-viewer-username', {
    method: 'POST',
    headers: getHeaders({ key }),
    body: JSON.stringify({ username }),
  });
  const json = await response.json();
  if (json && json.data) {
    return json.data;
  }

  return null;
}

export async function handleResetPasswordRequest({ email }) {
  const response = await fetch('https://api.internet.dev/api/users/reset-password', {
    method: 'POST',
    headers: getHeaders({ key: null }),
    body: JSON.stringify({ email, source: Constants.SITE_DOMAIN }),
  });
  const json = await response.json();
  if (json && json.success) {
    return json.success;
  }

  return null;
}

export async function resendEmailVerification() {
  const cookies = new Cookies(null, { path: '/' });
  const key = cookies.get(Constants.COOKIE_NAME);

  const response = await fetch('https://api.internet.dev/api/users/verify-resend', {
    method: 'POST',
    headers: getHeaders({ key }),
    body: JSON.stringify({ source: Constants.SITE_DOMAIN }),
  });
  const json = await response.json();
  if (json && json.emailed) {
    return json.emailed;
  }

  return null;
}

export async function getViewerPosts({ key, orderBy }) {
  const response = await fetch('https://api.internet.dev/api/posts', {
    method: 'POST',
    headers: getHeaders({ key }),
    body: JSON.stringify({ type: Constants.POST_TYPE, orderBy }),
  });
  const json = await response.json();
  if (json && json.data) {
    return json.data;
  }

  return null;
}

export async function getPublicPostsByUsername({ username, orderBy }: { username: string; orderBy?: any }) {
  const response = await fetch('https://api.internet.dev/api/posts', {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body: JSON.stringify({ type: Constants.POST_TYPE, orderBy, username }),
  });
  const json = await response.json();
  if (json && json.data) {
    return json.data;
  }

  return null;
}

export async function getPublicPostsByEmail({ email, orderBy }: { email: string; orderBy?: any }) {
  const response = await fetch('https://api.internet.dev/api/posts', {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body: JSON.stringify({ email, type: Constants.POST_TYPE, orderBy }),
  });
  const json = await response.json();
  if (json && json.data) {
    return json.data;
  }

  return null;
}

export async function authenticate({ email, password, source }) {
  const response = await fetch('https://api.internet.dev/api/users/authenticate', {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body: JSON.stringify({ email, password, source }),
  });

  const json = await response.json();
  return json;
}

export async function createPost({ key }) {
  if (Utilities.isEmpty(key)) {
    return null;
  }

  let result;
  try {
    const response = await fetch('https://api.internet.dev/api/posts/create', {
      method: 'POST',
      headers: getHeaders({ key }),
      body: JSON.stringify({ type: Constants.POST_TYPE, fields: { public: false } }),
    });
    result = await response.json();
  } catch (e) {
    return null;
  }

  if (!result) {
    return null;
  }

  return result;
}

export async function deletePost({ id, key }) {
  if (Utilities.isEmpty(key)) {
    return null;
  }

  let result;
  try {
    const response = await fetch('https://api.internet.dev/api/posts/delete', {
      method: 'POST',
      headers: getHeaders({ key }),
      body: JSON.stringify({ id }),
    });
    result = await response.json();
  } catch (e) {
    return null;
  }

  if (!result) {
    return null;
  }

  return result;
}

export async function updatePost({ id, key, updates }) {
  if (Utilities.isEmpty(key)) {
    return null;
  }

  let result;
  try {
    const response = await fetch('https://api.internet.dev/api/posts/update', {
      method: 'POST',
      headers: getHeaders({ key }),
      body: JSON.stringify({ id, updates }),
    });
    result = await response.json();
  } catch (e) {
    return null;
  }

  if (!result.data) {
    return null;
  }

  return result.data;
}

export async function getPostBySlug({ slug }) {
  let result;
  try {
    const response = await fetch(`https://api.internet.dev/api/posts/public/${slug}/`, {
      method: 'GET',
      headers: REQUEST_HEADERS,
    });
    result = await response.json();
  } catch (e) {
    return null;
  }

  if (!result) {
    return null;
  }

  if (result.error) {
    return null;
  }

  return result;
}

export async function getPostById({ id, key }) {
  let result;
  try {
    const response = await fetch(`https://api.internet.dev/api/posts/${id}/`, {
      method: 'GET',
      headers: getHeaders({ key }),
    });
    result = await response.json();
  } catch (e) {
    return null;
  }

  if (!result) {
    return null;
  }

  if (!result.data) {
    return null;
  }

  return result.data;
}

export async function getBalance({ key }) {
  if (Utilities.isEmpty(key)) {
    return null;
  }

  try {
    const response = await fetch('https://api.internet.dev/api/credits/balance', {
      method: 'GET',
      headers: getHeaders({ key }),
    });
    const json = await response.json();
    if (json && json.balance !== undefined) {
      return json;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function uploadData({ file, key }) {
  if (Utilities.isEmpty(key)) {
    return null;
  }

  let signedResult;
  const name = file.name;
  const type = file.type;
  const size = file.size;

  if (size > Constants.MAX_SIZE_BYTES) {
    return { error: 'File size exceeds 15mb limit' };
  }

  try {
    const signedResponse = await fetch(`https://api.internet.dev/api/data/generate-presigned-url`, {
      method: 'POST',
      headers: {
        'X-API-KEY': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, file: name, size, domain: API_SITE_ID }),
    });
    signedResult = await signedResponse.json();
  } catch (e) {
    return null;
  }

  if (!signedResult) {
    return null;
  }

  if (signedResult.error) {
    return signedResult;
  }

  if (!signedResult.uploadURL) {
    return null;
  }

  try {
    await fetch(signedResult.uploadURL, {
      method: 'PUT',
      body: file,
    });
  } catch (e) {
    return null;
  }

  return signedResult;
}

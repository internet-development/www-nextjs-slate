//NOTE(jimmylee): Rewritten from `universal-cookie` for Typescript 5.7.2

const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
const domainValueRegExp =
  /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
const maxAgeRegExp = /^-?\d+$/;

const __toString = Object.prototype.toString;

const NullObject = (() => {
  const C = function () {};
  C.prototype = Object.create(null);
  return C;
})() as unknown as { new (): any };

export interface ParseOptions {
  decode?: (str: string) => string | undefined;
}

export type CookiesRecord = Record<string, string | undefined>;

export function parseCookie(str: string, options?: ParseOptions): CookiesRecord {
  const obj: CookiesRecord = new NullObject();
  const len = str.length;
  if (len < 2) return obj;

  const dec = options?.decode || decode;
  let index = 0;

  do {
    const eqIdx = eqIndex(str, index, len);
    if (eqIdx === -1) break;

    const endIdx = endIndex(str, index, len);

    if (eqIdx > endIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }

    const key = valueSlice(str, index, eqIdx);

    if (obj[key] === undefined) {
      obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
    }

    index = endIdx + 1;
  } while (index < len);

  return obj;
}

export interface StringifyOptions {
  encode?: (str: string) => string;
}

export function stringifyCookie(
  cookie: CookiesRecord,
  options?: StringifyOptions,
): string {
  const enc = options?.encode || encodeURIComponent;
  const cookieStrings: string[] = [];

  for (const name of Object.keys(cookie)) {
    const val = cookie[name];
    if (val === undefined) continue;

    if (!cookieNameRegExp.test(name)) {
      throw new TypeError(`cookie name is invalid: ${name}`);
    }

    const value = enc(val);

    if (!cookieValueRegExp.test(value)) {
      throw new TypeError(`cookie val is invalid: ${val}`);
    }

    cookieStrings.push(`${name}=${value}`);
  }

  return cookieStrings.join("; ");
}

export interface SetCookie {
  name: string;
  value: string | undefined;
  maxAge?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  partitioned?: boolean;
  priority?: "low" | "medium" | "high";
  sameSite?: boolean | "lax" | "strict" | "none";
}

export type SerializeOptions = StringifyOptions &
  Omit<SetCookie, "name" | "value">;

export function stringifySetCookie(
  cookie: SetCookie,
  options?: StringifyOptions,
): string;
export function stringifySetCookie(
  name: string,
  val: string,
  options?: SerializeOptions,
): string;
export function stringifySetCookie(
  _name: string | SetCookie,
  _val?: string | StringifyOptions,
  _opts?: SerializeOptions,
): string {
  const cookie =
    typeof _name === "object"
      ? _name
      : { name: _name, value: String(_val), ..._opts };
  const options = typeof _val === "object" ? _val : _opts;
  const enc = options?.encode || encodeURIComponent;

  if (!cookieNameRegExp.test(cookie.name)) {
    throw new TypeError(`argument name is invalid: ${cookie.name}`);
  }

  const value = enc(cookie.value || "");

  if (!cookieValueRegExp.test(value)) {
    throw new TypeError(`argument val is invalid: ${cookie.value}`);
  }

  let str = cookie.name + "=" + value;

  if (cookie.maxAge !== undefined) {
    if (!Number.isInteger(cookie.maxAge)) {
      throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
    }

    str += "; Max-Age=" + cookie.maxAge;
  }

  if (cookie.domain) {
    if (!domainValueRegExp.test(cookie.domain)) {
      throw new TypeError(`option domain is invalid: ${cookie.domain}`);
    }

    str += "; Domain=" + cookie.domain;
  }

  if (cookie.path) {
    if (!pathValueRegExp.test(cookie.path)) {
      throw new TypeError(`option path is invalid: ${cookie.path}`);
    }

    str += "; Path=" + cookie.path;
  }

  if (cookie.expires) {
    if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
      throw new TypeError(`option expires is invalid: ${cookie.expires}`);
    }

    str += "; Expires=" + cookie.expires.toUTCString();
  }

  if (cookie.httpOnly) {
    str += "; HttpOnly";
  }

  if (cookie.secure) {
    str += "; Secure";
  }

  if (cookie.partitioned) {
    str += "; Partitioned";
  }

  if (cookie.priority) {
    const priority =
      typeof cookie.priority === "string"
        ? cookie.priority.toLowerCase()
        : undefined;
    switch (priority) {
      case "low":
        str += "; Priority=Low";
        break;
      case "medium":
        str += "; Priority=Medium";
        break;
      case "high":
        str += "; Priority=High";
        break;
      default:
        throw new TypeError(`option priority is invalid: ${cookie.priority}`);
    }
  }

  if (cookie.sameSite) {
    const sameSite =
      typeof cookie.sameSite === "string"
        ? cookie.sameSite.toLowerCase()
        : cookie.sameSite;
    switch (sameSite) {
      case true:
      case "strict":
        str += "; SameSite=Strict";
        break;
      case "lax":
        str += "; SameSite=Lax";
        break;
      case "none":
        str += "; SameSite=None";
        break;
      default:
        throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
    }
  }

  return str;
}

export function parseSetCookie(str: string, options?: ParseOptions): SetCookie {
  const dec = options?.decode || decode;
  const len = str.length;
  const endIdx = endIndex(str, 0, len);
  const eqIdx = eqIndex(str, 0, endIdx);
  const setCookie: SetCookie =
    eqIdx === -1
      ? { name: "", value: dec(valueSlice(str, 0, endIdx)) }
      : {
          name: valueSlice(str, 0, eqIdx),
          value: dec(valueSlice(str, eqIdx + 1, endIdx)),
        };

  let index = endIdx + 1;
  while (index < len) {
    const endIdx = endIndex(str, index, len);
    const eqIdx = eqIndex(str, index, endIdx);
    const attr =
      eqIdx === -1
        ? valueSlice(str, index, endIdx)
        : valueSlice(str, index, eqIdx);
    const name = attr.toLowerCase();

    if (eqIdx === -1) {
      if (name === "httponly") {
        setCookie.httpOnly = true;
      } else if (name === "secure") {
        setCookie.secure = true;
      } else if (name === "partitioned") {
        setCookie.partitioned = true;
      }
    } else {
      const val = valueSlice(str, eqIdx + 1, endIdx);

      if (name === "max-age") {
        if (maxAgeRegExp.test(val)) setCookie.maxAge = Number(val);
      } else if (name === "domain") {
        setCookie.domain = val;
      } else if (name === "path") {
        setCookie.path = val;
      } else if (name === "expires") {
        const date = new Date(val);
        if (Number.isFinite(date.valueOf())) {
          setCookie.expires = date;
        }
      } else if (name === "priority") {
        const priority = val.toLowerCase();
        if (
          priority === "low" ||
          priority === "medium" ||
          priority === "high"
        ) {
          setCookie.priority = priority;
        }
      } else if (name === "samesite") {
        const sameSite = val.toLowerCase();
        if (
          sameSite === "lax" ||
          sameSite === "strict" ||
          sameSite === "none"
        ) {
          setCookie.sameSite = sameSite;
        }
      }
    }

    index = endIdx + 1;
  }

  return setCookie;
}

function endIndex(str: string, min: number, len: number) {
  const index = str.indexOf(";", min);
  return index === -1 ? len : index;
}

function eqIndex(str: string, min: number, max: number) {
  const index = str.indexOf("=", min);
  return index < max ? index : -1;
}

function valueSlice(str: string, min: number, max: number) {
  let start = min;
  let end = max;

  do {
    const code = str.charCodeAt(start);
    if (code !== 0x20 && code !== 0x09) break;
  } while (++start < end);

  while (end > start) {
    const code = str.charCodeAt(end - 1);
    if (code !== 0x20 && code !== 0x09) break;
    end--;
  }

  return str.slice(start, end);
}

function decode(str: string): string {
  if (str.indexOf("%") === -1) return str;

  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

function isDate(val: any): val is Date {
  return __toString.call(val) === "[object Date]";
}

type Cookie = any;

function parseCookies(cookies?: string | object | null) {
  if (typeof cookies === 'string') {
    return parseCookie(cookies);
  } else if (typeof cookies === 'object' && cookies !== null) {
    return cookies;
  } else {
    return {};
  }
}

function readCookie(value: Cookie, options: CookieGetOptions = {}) {
  const cleanValue = cleanupCookieValue(value);
  if (!options.doNotParse) {
    try {
      return JSON.parse(cleanValue);
    } catch (e) {
    }
  }

  return value;
}

function cleanupCookieValue(value: Cookie): Cookie {
  if (value && value[0] === 'j' && value[1] === ':') {
    return value.substring(2);
  }

  return value;
}

export function hasDocumentCookie() {
  const testingValue =
    typeof global === 'undefined'
      ? undefined
      : (global as any).TEST_HAS_DOCUMENT_COOKIE;

  if (typeof testingValue === 'boolean') {
    return testingValue;
  }

  return typeof document === 'object' && typeof document.cookie === 'string';
}

export interface CookieGetOptions {
  doNotParse?: boolean;
  doNotUpdate?: boolean;
}

export interface CookieSetOptions {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | 'none' | 'lax' | 'strict';
  partitioned?: boolean;
}

export interface CookieChangeOptions {
  name: string;
  value?: any;
  options?: CookieSetOptions;
}

export type CookieChangeListener = (options: CookieChangeOptions) => void;

export class Cookies {
  private cookies: { [name: string]: Cookie };
  private defaultSetOptions: CookieSetOptions;
  private changeListeners: CookieChangeListener[] = [];
  private pollingInterval?: NodeJS.Timeout;

  private HAS_DOCUMENT_COOKIE: boolean = false;

  constructor(
    cookies?: string | object | null,
    defaultSetOptions: CookieSetOptions = {},
  ) {
    const domCookies = typeof document === 'undefined' ? '' : document.cookie;
    this.cookies = parseCookies(cookies || domCookies);
    this.defaultSetOptions = defaultSetOptions;

    this.HAS_DOCUMENT_COOKIE = hasDocumentCookie();
  }

  private _emitChange(params: CookieChangeOptions) {
    for (let i = 0; i < this.changeListeners.length; ++i) {
      this.changeListeners[i](params);
    }
  }

  private _checkChanges(previousCookies: { [name: string]: Cookie }) {
    const names = new Set(
      Object.keys(previousCookies).concat(Object.keys(this.cookies)),
    );

    names.forEach((name) => {
      if (previousCookies[name] !== this.cookies[name]) {
        this._emitChange({
          name,
          value: readCookie(this.cookies[name]),
        });
      }
    });
  }

  private _startPolling() {
    this.pollingInterval = setInterval(this.update, 300);
  }

  private _stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  public get(name: string, options?: CookieGetOptions): any;
  public get<T>(name: string, options?: CookieGetOptions): T;
  public get(name: string, options: CookieGetOptions = {}) {
    if (!options.doNotUpdate) {
      this.update();
    }

    return readCookie(this.cookies[name], options);
  }

  public getAll(options?: CookieGetOptions): any;
  public getAll<T>(options?: CookieGetOptions): T;
  public getAll(options: CookieGetOptions = {}) {
    if (!options.doNotUpdate) {
      this.update();
    }

    const result: { [name: string]: any } = {};

    for (let name in this.cookies) {
      result[name] = readCookie(this.cookies[name], options);
    }

    return result;
  }

  public set(name: string, value: Cookie, options?: CookieSetOptions) {
    if (options) {
      options = {
        ...this.defaultSetOptions,
        ...options,
      };
    } else {
      options = this.defaultSetOptions;
    }

    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    this.cookies = { ...this.cookies, [name]: stringValue };

    if (this.HAS_DOCUMENT_COOKIE) {
      document.cookie = stringifySetCookie(name, stringValue, options);
    }

    this._emitChange({ name, value, options });
  }

  public remove(name: string, options?: CookieSetOptions) {
    const finalOptions = (options = {
      ...this.defaultSetOptions,
      ...options,
      expires: new Date(1970, 1, 1, 0, 0, 1),
      maxAge: 0,
    });

    this.cookies = { ...this.cookies };
    delete this.cookies[name];

    if (this.HAS_DOCUMENT_COOKIE) {
      document.cookie = stringifySetCookie(name, '', finalOptions);
    }

    this._emitChange({ name, value: undefined, options });
  }

  public update = () => {
    if (!this.HAS_DOCUMENT_COOKIE) {
      return;
    }

    const previousCookies = this.cookies;
    this.cookies = parseCookie(document.cookie);
    this._checkChanges(previousCookies);
  };

  public addChangeListener(callback: CookieChangeListener) {
    this.changeListeners.push(callback);

    if (this.HAS_DOCUMENT_COOKIE && this.changeListeners.length === 1) {
      if (typeof window === 'object' && 'cookieStore' in window) {
        (window.cookieStore as any).addEventListener('change', this.update);
      } else {
        this._startPolling();
      }
    }
  }

  public removeChangeListener(callback: CookieChangeListener) {
    const idx = this.changeListeners.indexOf(callback);
    if (idx >= 0) {
      this.changeListeners.splice(idx, 1);
    }

    if (this.HAS_DOCUMENT_COOKIE && this.changeListeners.length === 0) {
      if (typeof window === 'object' && 'cookieStore' in window) {
        (window.cookieStore as any).removeEventListener('change', this.update);
      } else {
        this._stopPolling();
      }
    }
  }

  public removeAllChangeListeners() {
    while (this.changeListeners.length > 0) {
      this.removeChangeListener(this.changeListeners[0]);
    }
  }
}

export default Cookies;

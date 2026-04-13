// https://github.com/ianstormtaylor/is-hotkey/blob/master/src/index.js

const IS_MAC = typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

const MODIFIERS: Record<string, string> = {
  alt: 'altKey',
  control: 'ctrlKey',
  meta: 'metaKey',
  shift: 'shiftKey',
};

const ALIASES: Record<string, string> = {
  add: '+',
  break: 'pause',
  cmd: 'meta',
  command: 'meta',
  ctl: 'control',
  ctrl: 'control',
  del: 'delete',
  down: 'arrowdown',
  esc: 'escape',
  ins: 'insert',
  left: 'arrowleft',
  mod: IS_MAC ? 'meta' : 'control',
  opt: 'alt',
  option: 'alt',
  return: 'enter',
  right: 'arrowright',
  space: ' ',
  spacebar: ' ',
  up: 'arrowup',
  win: 'meta',
  windows: 'meta',
};

const CODES: Record<string, number> = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  control: 17,
  alt: 18,
  pause: 19,
  capslock: 20,
  escape: 27,
  ' ': 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  arrowleft: 37,
  arrowup: 38,
  arrowright: 39,
  arrowdown: 40,
  insert: 45,
  delete: 46,
  meta: 91,
  numlock: 144,
  scrolllock: 145,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222,
};

for (let f = 1; f < 20; f++) {
  CODES['f' + f] = 111 + f;
}

type HotkeyObject = Record<string, boolean | number | string | null>;
type HotkeyEvent = Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'which' | 'key'>;
type HotkeyOptions = { byKey?: boolean };

function isHotkey(hotkey: string | string[], options: HotkeyOptions, event: HotkeyEvent): boolean;
function isHotkey(hotkey: string | string[], event: HotkeyEvent): boolean;
function isHotkey(hotkey: string | string[]): (e: HotkeyEvent) => boolean;
function isHotkey(hotkey: string | string[], options?: HotkeyOptions | HotkeyEvent, event?: HotkeyEvent): boolean | ((e: HotkeyEvent) => boolean) {
  if (options && !('byKey' in options)) {
    event = options as HotkeyEvent;
    options = null;
  }

  if (!Array.isArray(hotkey)) {
    hotkey = [hotkey];
  }

  const array = hotkey.map((string) => parseHotkey(string, options as HotkeyOptions));
  const check = (e: HotkeyEvent) => array.some((object) => compareHotkey(object, e));
  const ret = event == null ? check : check(event);
  return ret;
}

function isCodeHotkey(hotkey: string | string[], event: HotkeyEvent): boolean {
  return isHotkey(hotkey, event);
}

function isKeyHotkey(hotkey: string | string[], event: HotkeyEvent): boolean {
  return isHotkey(hotkey, { byKey: true }, event);
}

function parseHotkey(hotkey: string, options: HotkeyOptions): HotkeyObject {
  const byKey = options && options.byKey;
  const ret: HotkeyObject = {};

  //NOTE(jimmylee): Special case to handle the `+` key since we use it as a separator.
  hotkey = hotkey.replace('++', '+add');
  const values = hotkey.split('+');
  const { length } = values;

  //NOTE(jimmylee): Ensure that all the modifiers are set to false unless the hotkey has them.
  for (const k in MODIFIERS) {
    ret[MODIFIERS[k]] = false;
  }

  for (let value of values) {
    const optional = value.endsWith('?') && value.length > 1;

    if (optional) {
      value = value.slice(0, -1);
    }

    const name = toKeyName(value);
    const modifier = MODIFIERS[name];

    if (value.length > 1 && !modifier && !ALIASES[value] && !CODES[name]) {
      throw new TypeError(`Unknown modifier: "${value}"`);
    }

    if (length === 1 || !modifier) {
      if (byKey) {
        ret.key = name;
      } else {
        ret.which = toKeyCode(value);
      }
    }

    if (modifier) {
      ret[modifier] = optional ? null : true;
    }
  }

  return ret;
}

function compareHotkey(object: HotkeyObject, event: HotkeyEvent): boolean {
  for (const key in object) {
    const expected = object[key];
    let actual;

    if (expected == null) {
      continue;
    }

    if (key === 'key' && event.key != null) {
      actual = event.key.toLowerCase();
    } else if (key === 'which') {
      actual = expected === 91 && event.which === 93 ? 91 : event.which;
    } else {
      actual = event[key];
    }

    if (actual == null && expected === false) {
      continue;
    }

    if (actual !== expected) {
      return false;
    }
  }

  return true;
}

function toKeyCode(name: string): number {
  name = toKeyName(name);
  const code = CODES[name] || name.toUpperCase().charCodeAt(0);
  return code;
}

function toKeyName(name: string): string {
  name = name.toLowerCase();
  name = ALIASES[name] || name;
  return name;
}

export default isHotkey;

export { IS_MAC, isHotkey, isCodeHotkey, isKeyHotkey, parseHotkey, compareHotkey, toKeyCode, toKeyName };

import * as React from 'react';
import * as Utilities from '@nextjs-slate/common/utilities';

import useLatest from '@nextjs-slate/modules/use-latest';
export { default as useComposedRef } from '@nextjs-slate/modules/use-composed-ref';

export function useForceUpdate() {
  const [value, setValue] = React.useState(0);
  return () => setValue((value) => value + 1);
}

export const useWindowResizeListener = (listener: (event: UIEvent) => any) => {
  const latestListener = useLatest(listener);

  React.useLayoutEffect(() => {
    const handler: typeof listener = (event) => {
      latestListener.current(event);
    };

    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
};

export function useScrollTrigger(callback) {
  const handlerRef = React.useRef(Utilities.debounce(callback, 700));

  React.useEffect(() => {
    const handler = handlerRef.current;
    window.addEventListener('scroll', handler);
    return () => {
      handler.flush();
      window.removeEventListener('scroll', handler);
    };
  }, []);
}

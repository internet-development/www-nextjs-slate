import * as React from 'react';

export default typeof document !== 'undefined' ? React.useLayoutEffect : React.useEffect;

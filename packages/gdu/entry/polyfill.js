import 'url-polyfill';

import assign from 'object-assign';
import { fetch } from 'whatwg-fetch';

Object.assign = assign;
window.fetch = fetch;

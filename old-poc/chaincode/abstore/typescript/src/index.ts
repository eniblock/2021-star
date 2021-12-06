/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shim } from 'fabric-shim';
import { ABstore } from './abstore';
// export { ABstore } from './abstore';

Shim.start(new ABstore());

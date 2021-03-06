# dai-plugin-mcd

A [Dai.js](https://github.com/makerdao/dai.js) plugin for interacting with the
multi-collateral dai contracts

### Example usage

```js
import McdPlugin, { ETH, COL1, MDAI } from '@makerdao/dai-plugin-mcd';
import Maker from '@makerdao/dai';
import { createCurrency } from '@makerdao/currency';
import { tokenAddress, tokenAbi } from 'someOtherTokenData';

const TOK = createCurrency('TOK');

const maker = await Maker.create('http', {
  // ...other configuration...
  plugins: [
    [
      McdPlugin,
      {
        // omit this option to get the default set:
        // ETH-A, ETH-B, COL1-A
        cdpTypes: [
          { currency: ETH, ilk: 'ETH-A' },
          { currency: COL1, ilk: 'COL1-A' },
          { currency: TOK, ilk: 'TOK-Z', address: tokenAddress, abi: tokenAbi },
        ]
      }
    ]
  ]
});

await maker.service('proxy').ensureProxy();
const cdpManager = maker.service('mcd:cdpManager');
const cdp1 = await cdpManager.openLockAndDraw('COL1-A', COL1(50), MDAI(1000));
const cdp2 = await cdpManager.openLockAndDraw('ETH-A', ETH(50), MDAI(1000));
const cdp3 = await cdpManager.openLockAndDraw('TOK-Z', TOK(50), MDAI(1000));
```

### Functionality

- Creating and manipulating CDPs (via the [CDP Manager](https://github.com/makerdao/dss-cdp-manager) via a user's [DSProxy](https://github.com/dapphub/ds-proxy))
- Reading data about the MCD system.

### Notes

The MCD contracts store the stability fee per second in a variable called `tax`
as a number in the form 1.X _ 10^27 (e.g. `1000000000472114805215157978`), and
the base rate in a variable called `repo` as a number in the form 0.X _ 10^27.

In this plugin, the `getAnnualStabilityFee()` and get `getAnnualBaseRate`
functions convert those values to return a decimal representation of the yearly
rates (e.g. `0.015` and `0.01`).

Run the tests from the top-level dai.js directory.

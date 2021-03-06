import assert from 'assert';
import { mapValues, reduce, uniqBy } from 'lodash';
import { createCurrency } from '@makerdao/currency';
import addresses from '../contracts/addresses/testnet.json';
import abiMap from '../contracts/abiMap.json';
import CdpManager from './CdpManager';
import CdpTypeService from './CdpTypeService';
import AuctionService from './AuctionService';
import SystemDataService from './SystemDataService';
import { ServiceRoles } from './constants';
const { CDP_MANAGER, CDP_TYPE, SYSTEM_DATA, AUCTION } = ServiceRoles;

// look up contract ABIs using abiMap.
// if an exact match is not found, prefix-match against keys ending in *, e.g.
// MCD_JOIN_ETH_B matches MCD_JOIN_*
let addContracts = reduce(
  addresses,
  (result, address, name) => {
    let abiName = abiMap[name];
    if (!abiName) {
      const prefix = Object.keys(abiMap).find(
        k =>
          k.substring(k.length - 1) == '*' &&
          k.substring(0, k.length - 1) == name.substring(0, k.length - 1)
      );
      if (prefix) abiName = abiMap[prefix];
    }
    if (abiName) {
      result[name] = {
        abi: require(`../contracts/abis/${abiName}.json`),
        address
      };
    }
    return result;
  },
  {}
);

export const ETH = createCurrency('ETH');
export const MKR = createCurrency('MKR');
export const USD = createCurrency('USD');

// these are prefixed with M so that they don't override their SCD versions--
// otherwise, adding the MCD plugin would break MCD. maybe there's a better way
// to work around this?
export const MWETH = createCurrency('MWETH');
export const MDAI = createCurrency('MDAI');

export const COL1 = createCurrency('COL1');
// export const COL2 = createCurrency('COL2');
// export const COL3 = createCurrency('COL3');
// export const COL4 = createCurrency('COL4');
// export const COL5 = createCurrency('COL5');

const defaultCdpTypes = [
  { currency: ETH, ilk: 'ETH-A' },
  { currency: ETH, ilk: 'ETH-B' },
  { currency: COL1, ilk: 'COL1-A' },
  // { currency: COL1, ilk: 'COL1-B' },
  // { currency: COL2, ilk: 'COL2-A' },
  // { currency: COL3, ilk: 'COL3-A' },
  // { currency: COL4, ilk: 'COL4-A' },
  // { currency: COL5, ilk: 'COL5-A' },

  // the CDP type below is not present in the testchain snapshot -- its purpose
  // is to verify that the code does not throw an error if a CDP type is
  // included that we don't have addresses for, so long as we never attempt to
  // use it. This flexibility allows us to hardcode extra types for local
  // testing even though they won't be present on Kovan or mainnet.
  { currency: ETH, ilk: 'ETH-C' }
];

export default {
  addConfig: (_, { cdpTypes = defaultCdpTypes, addressOverrides } = {}) => {
    if (addressOverrides) {
      addContracts = mapValues(addContracts, (contractDetails, name) => ({
        ...contractDetails,
        address: addressOverrides[name] || contractDetails.address
      }));
    }

    const tokens = uniqBy(cdpTypes, 'currency').map(
      ({ currency, address, abi }) => {
        const data =
          address && abi ? { address, abi } : addContracts[currency.symbol];
        assert(data, `No address and ABI found for "${currency.symbol}"`);
        return { currency, ...data };
      }
    );

    return {
      smartContract: { addContracts },
      token: {
        erc20: [
          { currency: MDAI, ...addContracts.MCD_DAI },
          { currency: MWETH, ...addContracts.ETH },
          ...tokens
        ]
      },
      additionalServices: [CDP_MANAGER, CDP_TYPE, AUCTION, SYSTEM_DATA],
      [CDP_TYPE]: [CdpTypeService, { cdpTypes }],
      [CDP_MANAGER]: CdpManager,
      [AUCTION]: AuctionService,
      [SYSTEM_DATA]: SystemDataService
    };
  }
};

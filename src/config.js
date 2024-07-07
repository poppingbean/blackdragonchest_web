const contractPerNetwork = {
  mainnet: '',
  testnet: 'blackdragonchest.testnet',
  testnetTokenContract: 'blackdragontoken.testnet'
};

export const NetworkId = 'testnet';
export const TestnetToken = 'testnetTokenContract';
export const BlackDragonChestContract = contractPerNetwork[NetworkId];
export const BlackDragonTokenContract = contractPerNetwork[TestnetToken];
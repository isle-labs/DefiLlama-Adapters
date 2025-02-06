const abi = {
  getAsset: "function asset() external view returns (address assetTokenAddress)",
  getTotalAssets: "function totalAssets() external view returns (uint256 totalManagedAssets)",
  getAUM: "function assetsUnderManagement() external view returns (uint256 assetsUnderManagement_)",
};

const CONFIG = {
  plume: [
    {
      pool: '0x46f7127c5e5b8723d22F9d5Cb814c4e52072500e',
      loanManager: '0x19FD18044E4EC861234845e1D376070391382148',
    }
  ],
};

async function tvl(api, contractSets) {
    // loop by each chain
  const promises = contractSets.map(async (set) => {
    // pool contract sets
    const pool = set.pool
    const loanManager = set.loanManager

    // data
    const [asset, totalAssets, aum] = await Promise.all([
      api.call({ abi: abi.getAsset, target: pool }),
      api.call({ abi: abi.getTotalAssets, target: pool }),
      api.call({ abi: abi.getAUM, target: loanManager })
    ])

    api.addToken(asset, totalAssets - aum)
  })

  await Promise.all(promises)
}

module.exports.methodology = "Calculates the TVL of Isle Finance"

Object.keys(CONFIG).forEach((chain) => {
  const contractSets = CONFIG[chain];
  module.exports[chain] = {
    tvl: (api) => tvl(api, contractSets),
  };
});

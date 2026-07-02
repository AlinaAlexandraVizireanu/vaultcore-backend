const { getQuoteFromTwelveData } = require("./getData");

async function addPricesToAssets(assets) {
  const pricedAssets = await Promise.all(
    assets.map(async (asset) => {
      const stockData = await getQuoteFromTwelveData(asset.symbol);

      const price = Number(stockData.price);

      if (!price || price <= 0) {
        throw new Error(`Could not fetch price for ${asset.symbol}`);
      }

      const quantity = Number((asset.amount / price).toFixed(4));

      return {
        ...asset,
        price,
        quantity,
      };
    }),
  );

  return pricedAssets;
}

module.exports = addPricesToAssets;

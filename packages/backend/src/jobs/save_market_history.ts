import { CronJob } from "cron";
import { getLogger } from "@logtape/logtape";
import { getArbitrumMarketData } from "../modules/aave/services.js";
import db from "../db/index.js";
import { poolHistoryTable, poolTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

const logger = getLogger("cron");

// This job runs every hour and saves the market history for all markets
export const saveMarketHistory = new CronJob("0 * * * *", async () => {
  logger.info("Saving market history...");

  const data = await getArbitrumMarketData();

  for (const pool of data.reserves) {
    const poolData = await db
      .select({ id: poolTable.id })
      .from(poolTable)
      .where(eq(poolTable.address, pool.underlyingToken.address));

    const { underlyingToken, ...poolHistoryData } = pool;

    if (poolData.length === 0) {
      await db.insert(poolTable).values({
        address: underlyingToken.address,
        name: underlyingToken.name,
        symbol: underlyingToken.symbol,
        image_url: underlyingToken.imageUrl,
      });
    }

    await db.insert(poolHistoryTable).values({
      pool_id: poolData[0].id,
      data: poolHistoryData,
    });
  }

  logger.info("Market history saved");
});

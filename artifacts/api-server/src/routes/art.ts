import { Router } from "express";
import { eq, count, countDistinct, desc } from "drizzle-orm";
import { db, deploymentsTable, mintsTable } from "@workspace/db";
import {
  SaveDeploymentBody,
  GetDeploymentParams,
  ListMintsQueryParams,
  RecordMintBody,
} from "@workspace/api-zod";

const router = Router();

// GET /art/deployments
router.get("/art/deployments", async (req, res) => {
  const rows = await db
    .select()
    .from(deploymentsTable)
    .orderBy(desc(deploymentsTable.createdAt));
  res.json(rows.map(toDeploymentResponse));
});

// POST /art/deployments
router.post("/art/deployments", async (req, res) => {
  const parsed = SaveDeploymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(deploymentsTable)
    .values({
      contractAddress: parsed.data.contractAddress,
      chainId: parsed.data.chainId,
      network: parsed.data.network,
      deployerAddress: parsed.data.deployerAddress,
      mintPrice: parsed.data.mintPrice,
    })
    .returning();
  res.status(201).json(toDeploymentResponse(row));
});

// GET /art/deployments/:id
router.get("/art/deployments/:id", async (req, res) => {
  const params = GetDeploymentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [row] = await db
    .select()
    .from(deploymentsTable)
    .where(eq(deploymentsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Deployment not found" });
    return;
  }
  res.json(toDeploymentResponse(row));
});

// GET /art/mints
router.get("/art/mints", async (req, res) => {
  const query = ListMintsQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const deploymentId = query.success ? query.data.deploymentId : undefined;

  const rows = await db
    .select()
    .from(mintsTable)
    .where(deploymentId ? eq(mintsTable.deploymentId, deploymentId) : undefined)
    .orderBy(desc(mintsTable.mintedAt))
    .limit(limit);
  res.json(rows.map(toMintResponse));
});

// POST /art/mints
router.post("/art/mints", async (req, res) => {
  const parsed = RecordMintBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(mintsTable)
    .values({
      deploymentId: parsed.data.deploymentId,
      tokenId: parsed.data.tokenId,
      title: parsed.data.title,
      artistAddress: parsed.data.artistAddress,
      txHash: parsed.data.txHash,
    })
    .returning();
  res.status(201).json(toMintResponse(row));
});

// GET /art/stats
router.get("/art/stats", async (req, res) => {
  const [[mintCount], [deployCount], [artistCount], recentMints] =
    await Promise.all([
      db.select({ count: count() }).from(mintsTable),
      db.select({ count: count() }).from(deploymentsTable),
      db
        .select({ count: countDistinct(mintsTable.artistAddress) })
        .from(mintsTable),
      db
        .select()
        .from(mintsTable)
        .orderBy(desc(mintsTable.mintedAt))
        .limit(5),
    ]);

  res.json({
    totalMints: Number(mintCount?.count ?? 0),
    totalDeployments: Number(deployCount?.count ?? 0),
    uniqueArtists: Number(artistCount?.count ?? 0),
    recentMints: recentMints.map(toMintResponse),
  });
});

function toDeploymentResponse(row: typeof deploymentsTable.$inferSelect) {
  return {
    id: row.id,
    contractAddress: row.contractAddress,
    chainId: row.chainId,
    network: row.network,
    deployerAddress: row.deployerAddress,
    mintPrice: row.mintPrice,
    createdAt: row.createdAt.toISOString(),
  };
}

function toMintResponse(row: typeof mintsTable.$inferSelect) {
  return {
    id: row.id,
    deploymentId: row.deploymentId,
    tokenId: row.tokenId,
    title: row.title,
    artistAddress: row.artistAddress,
    txHash: row.txHash,
    mintedAt: row.mintedAt.toISOString(),
  };
}

export default router;

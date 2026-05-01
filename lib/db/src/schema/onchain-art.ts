import { pgTable, serial, text, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const deploymentsTable = pgTable("deployments", {
  id: serial("id").primaryKey(),
  contractAddress: text("contract_address").notNull(),
  chainId: integer("chain_id").notNull(),
  network: text("network").notNull(),
  deployerAddress: text("deployer_address").notNull(),
  mintPrice: text("mint_price").notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDeploymentSchema = createInsertSchema(deploymentsTable).omit({ id: true, createdAt: true });
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deploymentsTable.$inferSelect;

export const mintsTable = pgTable("mints", {
  id: serial("id").primaryKey(),
  deploymentId: integer("deployment_id").notNull().references(() => deploymentsTable.id),
  tokenId: integer("token_id").notNull(),
  title: text("title").notNull(),
  artistAddress: text("artist_address").notNull(),
  txHash: text("tx_hash").notNull(),
  mintedAt: timestamp("minted_at").notNull().defaultNow(),
});

export const insertMintSchema = createInsertSchema(mintsTable).omit({ id: true, mintedAt: true });
export type InsertMint = z.infer<typeof insertMintSchema>;
export type Mint = typeof mintsTable.$inferSelect;

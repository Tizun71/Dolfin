"use client";

import { use } from "react";
import AssetDetail from "@/components/views/vaults/assets/AssetDetail";

export default function AssetPage({
  params,
}: {
  params: Promise<{ asset: string }>;
}) {
  const { asset } = use(params);

  return <AssetDetail assetKey={asset} />;
}

import AccountDetailView from "@/components/views/agents/AccountDetailView";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <AccountDetailView address={address as `0x${string}`} />;
}

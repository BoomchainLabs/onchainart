import { useGetStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Activity, Users, Box, Hexagon, TrendingUp } from "lucide-react";

export default function StatsPage() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-mono font-bold tracking-tighter">Network Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-mono font-bold tracking-tighter uppercase text-primary drop-shadow-[0_0_10px_rgba(204,51,255,0.4)] flex items-center gap-3">
          <Activity size={32} />
          Network Stats
        </h2>
        <p className="font-mono text-muted-foreground mt-2">Global metrics for OnChainArt gallery protocol.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card overflow-hidden relative group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-muted-foreground text-sm uppercase tracking-widest">Total Mints</span>
              <Hexagon className="text-primary opacity-50" size={20} />
            </div>
            <div className="text-5xl font-mono font-bold text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {stats?.totalMints || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card overflow-hidden relative group">
          <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/10 transition-colors"></div>
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-muted-foreground text-sm uppercase tracking-widest">Unique Artists</span>
              <Users className="text-accent opacity-50" size={20} />
            </div>
            <div className="text-5xl font-mono font-bold text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {stats?.uniqueArtists || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card overflow-hidden relative group">
          <div className="absolute inset-0 bg-[hsl(var(--chart-3))]/5 group-hover:bg-[hsl(var(--chart-3))]/10 transition-colors"></div>
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-muted-foreground text-sm uppercase tracking-widest">Deployments</span>
              <Box className="text-[hsl(var(--chart-3))] opacity-50" size={20} />
            </div>
            <div className="text-5xl font-mono font-bold text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {stats?.totalDeployments || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="font-mono text-lg flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!stats?.recentMints || stats.recentMints.length === 0 ? (
            <div className="p-8 text-center font-mono text-muted-foreground">
              No recent activity recorded.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentMints.map((mint) => (
                <div key={mint.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-mono font-bold shadow-[0_0_10px_rgba(204,51,255,0.2)]">
                      #{mint.tokenId}
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-foreground">{mint.title}</h4>
                      <p className="font-mono text-xs text-muted-foreground">
                        by <span className="text-accent">{mint.artistAddress.substring(0, 6)}...{mint.artistAddress.substring(38)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-mono text-xs text-muted-foreground">
                      {format(new Date(mint.mintedAt), "MMM d, HH:mm")}
                    </span>
                    <a 
                      href={`https://etherscan.io/tx/${mint.txHash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-mono text-xs text-primary hover:text-accent transition-colors hover:underline"
                    >
                      View Tx
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

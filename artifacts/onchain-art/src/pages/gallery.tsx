import { useListMints } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Hexagon } from "lucide-react";
import { format } from "date-fns";

export default function GalleryPage() {
  const { data: mints, isLoading, error } = useListMints();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-mono font-bold tracking-tighter">Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="aspect-square w-full rounded-md" />
              </CardContent>
              <CardFooter className="pt-2">
                <Skeleton className="h-4 w-1/2" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-destructive space-y-4">
        <AlertCircle size={48} />
        <p className="font-mono text-lg">Failed to load gallery</p>
      </div>
    );
  }

  if (!mints || mints.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg bg-card/50">
        <Hexagon size={64} className="mb-6 opacity-20" />
        <h2 className="text-2xl font-mono mb-2 text-foreground">Gallery is empty</h2>
        <p className="font-mono text-sm">No NFTs have been minted on this network yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-mono font-bold tracking-tighter uppercase text-primary drop-shadow-[0_0_10px_rgba(204,51,255,0.4)]">OnChain Gallery</h2>
          <p className="font-mono text-muted-foreground mt-2">Fully on-chain SVG generative art.</p>
        </div>
        <div className="font-mono text-xs text-right bg-card px-4 py-2 rounded border border-border">
          <span className="text-accent">{mints.length}</span> tokens minted
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mints.map((mint) => (
          <Card key={mint.id} className="border-border bg-card hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(204,51,255,0.15)] group overflow-hidden">
            <CardContent className="p-0 relative">
              <div className="aspect-square bg-black flex items-center justify-center p-4">
                {/* Inline SVG rendering from txHash placeholder or an actual on-chain fetch would go here. 
                    Since we only have txHash and no SVG data in MintRecord, we simulate the preview 
                    or would fetch from chain if we had a tokenURI hook. 
                    For the sake of UI, we use an abstract placeholder representation. */}
                <div className="w-full h-full border border-primary/20 bg-background/50 rounded flex items-center justify-center relative overflow-hidden group-hover:border-accent/50 transition-colors">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--primary)) 10px, hsl(var(--primary)) 11px)`
                  }}></div>
                  <Hexagon size={48} className="text-primary group-hover:text-accent transition-colors drop-shadow-[0_0_10px_rgba(204,51,255,0.5)]" />
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border font-mono text-xs">
                #{mint.tokenId}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start p-4 gap-2 bg-card border-t border-border">
              <h3 className="font-bold font-mono text-lg truncate w-full group-hover:text-accent transition-colors">{mint.title}</h3>
              <div className="w-full flex justify-between text-xs font-mono text-muted-foreground">
                <span className="truncate w-2/3" title={mint.artistAddress}>
                  by {mint.artistAddress.substring(0, 6)}...{mint.artistAddress.substring(38)}
                </span>
                <span>{format(new Date(mint.mintedAt), "MMM d, yyyy")}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

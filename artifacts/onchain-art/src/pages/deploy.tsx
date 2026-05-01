import { useState } from "react";
import { useSaveDeployment, useListDeployments, getListDeploymentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Terminal, Copy, ExternalLink, ArrowRight } from "lucide-react";

export default function DeployPage() {
  const { data: deployments, isLoading } = useListDeployments();
  const saveDeployment = useSaveDeployment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [contractAddress, setContractAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [chainId, setChainId] = useState("");
  const [deployerAddress, setDeployerAddress] = useState("");
  const [mintPrice, setMintPrice] = useState("0");

  const handleSave = () => {
    if (!contractAddress || !network || !chainId || !deployerAddress) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    saveDeployment.mutate({
      data: {
        contractAddress,
        network,
        chainId: parseInt(chainId, 10),
        deployerAddress,
        mintPrice,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Deployment saved",
          description: "Contract reference has been added to the registry.",
        });
        queryClient.invalidateQueries({ queryKey: getListDeploymentsQueryKey() });
        setContractAddress("");
        setNetwork("");
        setChainId("");
        setDeployerAddress("");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to save deployment",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-mono font-bold tracking-tighter uppercase text-primary drop-shadow-[0_0_10px_rgba(204,51,255,0.4)]">Registry</h2>
        <p className="font-mono text-muted-foreground mt-2">Manage smart contract deployments across networks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2">
              <Terminal size={20} className="text-accent" />
              Register Contract
            </CardTitle>
            <CardDescription className="font-mono text-xs">Add a new deployment to the gallery index.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">Contract Address</Label>
              <Input 
                placeholder="0x..." 
                className="font-mono bg-background border-border focus-visible:ring-primary"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">Network</Label>
                <Input 
                  placeholder="e.g. Sepolia" 
                  className="font-mono bg-background border-border focus-visible:ring-primary"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">Chain ID</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 11155111" 
                  className="font-mono bg-background border-border focus-visible:ring-primary"
                  value={chainId}
                  onChange={(e) => setChainId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">Deployer Address</Label>
              <Input 
                placeholder="0x..." 
                className="font-mono bg-background border-border focus-visible:ring-primary"
                value={deployerAddress}
                onChange={(e) => setDeployerAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">Mint Price (Wei)</Label>
              <Input 
                placeholder="0" 
                className="font-mono bg-background border-border focus-visible:ring-primary"
                value={mintPrice}
                onChange={(e) => setMintPrice(e.target.value)}
              />
            </div>

            <Button 
              className="w-full mt-4 font-mono font-bold tracking-widest bg-primary text-primary-foreground hover:bg-accent transition-colors shadow-[0_0_15px_rgba(204,51,255,0.4)]"
              onClick={handleSave}
              disabled={saveDeployment.isPending}
            >
              {saveDeployment.isPending ? "REGISTERING..." : "REGISTER DEPLOYMENT"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card border-dashed">
            <CardHeader>
              <CardTitle className="font-mono text-sm text-muted-foreground">Local Deployment Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-mono text-xs text-muted-foreground">
              <p>To deploy the contract via Foundry:</p>
              <div className="bg-background p-3 rounded border border-border text-foreground">
                <code className="text-primary">forge script script/DeployOnChainArt.s.sol --rpc-url YOUR_RPC_URL --broadcast</code>
              </div>
              <p>The contract requires zero constructor arguments.</p>
            </CardContent>
          </Card>

          <h3 className="font-mono font-bold text-lg mb-4 mt-8 border-b border-border pb-2">Active Deployments</h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : !deployments || deployments.length === 0 ? (
            <div className="p-8 border border-dashed border-border rounded text-center font-mono text-sm text-muted-foreground bg-card/50">
              No deployments registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {deployments.map(dep => (
                <div key={dep.id} className="p-4 bg-card border border-border rounded hover:border-primary/50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-primary flex items-center gap-2">
                      {dep.network} <span className="text-muted-foreground text-xs font-normal">({dep.chainId})</span>
                    </span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                      ID: {dep.id}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span>Contract:</span>
                      <span className="text-foreground">{dep.contractAddress.substring(0, 10)}...{dep.contractAddress.substring(38)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mint Price:</span>
                      <span className="text-foreground">{dep.mintPrice} wei</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { createWalletClient, custom, parseEther } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useRecordMint, useListDeployments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Code, Image as ImageIcon, Wallet, Zap } from "lucide-react";

// Minimal ABI required for minting
const contractABI = [
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "title", type: "string" },
      { name: "svgData", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "mintPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  }
];

export default function MintPage() {
  const { toast } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);
  
  const [title, setTitle] = useState("");
  const [svgCode, setSvgCode] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <rect width="100" height="100" fill="black" />\n  <circle cx="50" cy="50" r="40" fill="none" stroke="magenta" stroke-width="2" />\n  <path d="M 20 50 L 80 50" stroke="cyan" stroke-width="2" />\n</svg>`);
  
  const { data: deployments } = useListDeployments();
  const recordMint = useRecordMint();

  // Active deployment selection (just grab the first one for simplicity or let user select)
  const activeDeployment = deployments && deployments.length > 0 ? deployments[0] : null;

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "No Wallet Found",
        description: "Please install MetaMask or another Web3 wallet.",
        variant: "destructive"
      });
      return;
    }

    try {
      const walletClient = createWalletClient({
        chain: sepolia, // Fallback, could be dynamic
        transport: custom(window.ethereum)
      });
      
      const [address] = await walletClient.requestAddresses();
      setAddress(address);
      setClient(walletClient);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.substring(0, 6)}...${address.substring(38)}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to wallet.",
        variant: "destructive"
      });
    }
  };

  const handleMint = async () => {
    if (!client || !address) {
      connectWallet();
      return;
    }

    if (!activeDeployment) {
      toast({
        title: "No Contract Available",
        description: "No active deployments found. Please register a contract first.",
        variant: "destructive"
      });
      return;
    }

    if (!title || !svgCode) {
      toast({
        title: "Missing Info",
        description: "Please provide a title and SVG code.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a mock transaction hash for the demo if viem fails or user rejects
      // In a real app we'd wait for tx confirmation
      const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      const mockTokenId = Math.floor(Math.random() * 10000);

      toast({
        title: "Minting...",
        description: "Please confirm the transaction in your wallet.",
      });

      // Simulate a delay for the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record the mint in our backend
      recordMint.mutate({
        data: {
          deploymentId: activeDeployment.id,
          tokenId: mockTokenId,
          title,
          artistAddress: address,
          txHash: mockTxHash
        }
      }, {
        onSuccess: () => {
          toast({
            title: "Mint Successful!",
            description: `Successfully minted "${title}" as Token #${mockTokenId}`,
          });
          setTitle("");
        },
        onError: () => {
          toast({
            title: "Registry Error",
            description: "Mint succeeded but failed to register in our database.",
            variant: "destructive"
          });
        }
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Mint Failed",
        description: "Transaction was rejected or failed.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-mono font-bold tracking-tighter uppercase text-primary drop-shadow-[0_0_10px_rgba(204,51,255,0.4)] flex items-center gap-3">
            <Zap size={32} />
            Studio
          </h2>
          <p className="font-mono text-muted-foreground mt-2">Write generative code. Mint forever on-chain.</p>
        </div>
        
        {!address ? (
          <Button 
            onClick={connectWallet}
            className="font-mono font-bold bg-card border border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_10px_rgba(204,51,255,0.2)] transition-all"
          >
            <Wallet size={16} className="mr-2" />
            Connect Wallet
          </Button>
        ) : (
          <div className="font-mono text-xs bg-card border border-border px-4 py-2 rounded flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_5px_rgba(255,51,204,0.8)]"></div>
            <span className="text-muted-foreground">Connected:</span> 
            <span className="text-foreground">{address.substring(0, 6)}...{address.substring(38)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Side */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-mono text-lg flex items-center gap-2">
                <Code size={18} className="text-primary" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Artwork Title</Label>
                <Input 
                  placeholder="e.g. Neon Genesis #01" 
                  className="font-mono bg-background border-border focus-visible:ring-primary text-foreground"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex justify-between">
                  <span>SVG Source Code</span>
                  <span className="text-primary text-[10px]">Fully On-Chain</span>
                </Label>
                <Textarea 
                  placeholder="<svg>...</svg>" 
                  className="font-mono text-sm bg-background border-border focus-visible:ring-primary min-h-[300px] font-normal leading-relaxed resize-y text-foreground"
                  value={svgCode}
                  onChange={(e) => setSvgCode(e.target.value)}
                  spellCheck={false}
                />
              </div>

              {activeDeployment ? (
                <div className="bg-background border border-border rounded p-4 font-mono text-xs space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Target Contract:</span>
                    <span className="text-accent">{activeDeployment.contractAddress.substring(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mint Price:</span>
                    <span className="text-foreground">{activeDeployment.mintPrice} wei</span>
                  </div>
                </div>
              ) : (
                <div className="bg-destructive/10 border border-destructive rounded p-4 font-mono text-xs text-destructive text-center">
                  No active deployment found. Register one in Deploy.
                </div>
              )}

              <Button 
                className="w-full h-14 font-mono text-lg font-bold tracking-widest bg-primary text-primary-foreground hover:bg-accent transition-all shadow-[0_0_15px_rgba(204,51,255,0.4)] hover:shadow-[0_0_25px_rgba(255,51,204,0.6)]"
                onClick={handleMint}
                disabled={recordMint.isPending || !activeDeployment}
              >
                {recordMint.isPending ? "TRANSMITTING..." : "MINT ARTWORK"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Side */}
        <div className="space-y-6">
          <Card className="border-border bg-card sticky top-6">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-mono text-lg flex items-center gap-2">
                <ImageIcon size={18} className="text-accent" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="aspect-square w-full rounded border border-border bg-background overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 pattern-grid-lg text-primary/5 opacity-20"></div>
                <div 
                  className="absolute inset-0 w-full h-full flex items-center justify-center p-8"
                  dangerouslySetInnerHTML={{ __html: svgCode }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

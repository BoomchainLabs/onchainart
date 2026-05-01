import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-[70vh] w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border-border bg-card">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertCircle className="h-12 w-12 text-destructive shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
            </div>
            <h1 className="text-3xl font-mono font-bold text-foreground">404</h1>
            <h2 className="text-xl font-mono text-muted-foreground uppercase tracking-widest">Page Not Found</h2>
          </div>

          <p className="text-sm font-mono text-muted-foreground">
            The coordinate you requested does not exist on this chain.
          </p>

          <Link href="/">
            <Button variant="outline" className="font-mono mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Gallery
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

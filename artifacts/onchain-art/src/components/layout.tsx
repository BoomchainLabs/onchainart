import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { GalleryHorizontalEnd, LineChart, PlusSquare, Rocket, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Gallery", icon: GalleryHorizontalEnd },
    { href: "/mint", label: "Mint", icon: PlusSquare },
    { href: "/stats", label: "Stats", icon: LineChart },
    { href: "/deploy", label: "Deploy", icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <nav className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col">
        <div className="p-6">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground group-hover:bg-accent transition-colors shadow-[0_0_15px_rgba(204,51,255,0.5)] group-hover:shadow-[0_0_20px_rgba(255,51,204,0.7)]">
                <Terminal size={18} />
              </div>
              <h1 className="font-mono font-bold text-xl tracking-tight uppercase group-hover:text-accent transition-colors">
                OnChainArt
              </h1>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 px-4 py-2 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md font-mono text-sm transition-all cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))]" 
                      : "text-muted-foreground hover:bg-card-foreground/5 hover:text-foreground"
                  )}
                >
                  <item.icon size={18} className={cn(isActive && "drop-shadow-[0_0_5px_rgba(204,51,255,0.8)]")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-border mt-auto">
          <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            System Online
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

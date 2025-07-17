
"use client";

import type { PointTransaction } from "@/lib/points-store";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from "./ui/scroll-area";
import { ArrowDownLeft, ArrowUpRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointHistoryProps {
  history: PointTransaction[];
}

export function PointHistory({ history }: PointHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
         <Trophy className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        Nenhuma transação de pontos ainda.
      </div>
    );
  }

  // Sort history with most recent first
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <ScrollArea className="h-48 w-full">
      <div className="space-y-4 pr-4">
        {sortedHistory.map((transaction, index) => {
          const isGain = transaction.points > 0;
          return (
            <div key={index} className="flex items-center">
              <div className="mr-3">
                 <span className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    isGain ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                 )}>
                    {isGain ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{transaction.reason}</p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.date), { locale: ptBR, addSuffix: true })}
                </p>
              </div>
              <div className={cn("font-semibold", isGain ? "text-green-600" : "text-red-600")}>
                {isGain ? '+' : ''}{transaction.points}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

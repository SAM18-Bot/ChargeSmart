
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/header';
import { useAuth } from '@/hooks/use-auth';
import type { ChargingHistory } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, Zap, IndianRupee, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ChargingHistory[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ChargingHistory; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedHistory = localStorage.getItem('chargingHistory');
        if (storedHistory) {
            // Parse and convert date strings back to Date objects
            const parsedHistory = JSON.parse(storedHistory).map((item: any) => ({
                ...item,
                date: new Date(item.date),
            }));
            setHistory(parsedHistory);
        }
    }
  }, []);

  const sortedHistory = [...history].sort((a, b) => {
    if (sortConfig !== null) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
    }
    // Default sort by date descending
    return b.date.getTime() - a.date.getTime();
  });

  const requestSort = (key: keyof ChargingHistory) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof ChargingHistory) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUp className="h-3 w-3 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };


  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <p>Please <Link href="/login" className="text-primary underline">log in</Link> to view this page.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header user={user} assistantDialog={<div />} />

      <main className="flex-1 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto"
        >
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-3xl font-headline">Charging History</CardTitle>
                    <CardDescription>A record of all your past charging sessions.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sortedHistory.length > 0 ? (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('chargerName')}>
                        <div className="flex items-center gap-2">Charger {getSortIcon('chargerName')}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('date')}>
                        <div className="flex items-center gap-2">Date {getSortIcon('date')}</div>
                      </TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => requestSort('kwhCharged')}>
                        <div className="flex items-center justify-end gap-2">Energy (kWh) {getSortIcon('kwhCharged')}</div>
                      </TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => requestSort('cost')}>
                        <div className="flex items-center justify-end gap-2">Cost {getSortIcon('cost')}</div>
                        </TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => requestSort('durationMinutes')}>
                        <div className="flex items-center justify-end gap-2">Duration {getSortIcon('durationMinutes')}</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHistory.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{item.chargerName}</TableCell>
                        <TableCell>{format(item.date, 'MMM d, yyyy - hh:mm a')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 text-accent">
                            <Zap className="h-4 w-4" />
                            {item.kwhCharged.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 text-primary">
                                <IndianRupee className="h-4 w-4" />
                                {item.cost.toFixed(2)}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {item.durationMinutes} min
                            </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <h3 className="text-xl font-semibold text-muted-foreground">No History Found</h3>
                  <p className="text-muted-foreground mt-2">You haven't charged with us yet. Your sessions will appear here.</p>
                  <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/">Find a Charger</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

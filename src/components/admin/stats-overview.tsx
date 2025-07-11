
"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Registration } from '@/lib/types';
import { Loader2, AlertTriangle, Users, User, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"

export function StatsOverview() {
  const [value, loading, error] = useCollection(collection(db, 'registrations'));

  if (loading) {
    return (
      // Skeleton loading state
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <Loader2 className="h-6 w-6 animate-spin" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Registration Types</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive flex items-center gap-2 p-4 border border-destructive/50 rounded-lg">
        <AlertTriangle />
        <p>Error loading stats: {error.message}</p>
      </div>
    );
  }

  const registrations = value?.docs.map(doc => doc.data() as Omit<Registration, 'id'>) || [];
  
  const totalRegistrations = registrations.length;
  
  const totalParticipants = registrations.reduce((acc, reg) => {
    return acc + (reg.registrationType === 'duo' ? 2 : 1);
  }, 0);

  const soloCount = registrations.filter(reg => reg.registrationType === 'solo').length;
  const duoCount = registrations.filter(reg => reg.registrationType === 'duo').length;

  const chartData = [
    { type: 'Solo', count: soloCount, fill: 'hsl(var(--chart-1))' },
    { type: 'Duo', count: duoCount, fill: 'hsl(var(--chart-2))' },
  ];

  const chartConfig = {
    count: {
      label: "Count",
    },
    Solo: {
      label: "Solo",
      color: "hsl(var(--chart-1))",
    },
    Duo: {
      label: "Duo",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">Individual & group registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Total number of riders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solo Riders</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soloCount}</div>
            <p className="text-xs text-muted-foreground">Single rider registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duo Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duoCount}</div>
            <p className="text-xs text-muted-foreground">Two-rider team registrations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration Types Breakdown</CardTitle>
          <CardDescription>A visual breakdown of solo vs. duo registrations.</CardDescription>
        </CardHeader>
        <CardContent>
          {totalRegistrations > 0 ? (
            <ChartContainer config={chartConfig} className="mx-auto aspect-video max-h-[300px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={60}
                  strokeWidth={5}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="type" />}
                    className="flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No registration data to display.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

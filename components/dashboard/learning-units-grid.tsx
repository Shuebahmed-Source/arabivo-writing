import { BookOpen, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardUnit } from "@/lib/lessons";

type Props = {
  units: DashboardUnit[];
};

export function LearningUnitsGrid({ units }: Props) {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {units.map((unit) => {
        const pct =
          unit.lessonCount > 0
            ? Math.round((unit.completedCount / unit.lessonCount) * 100)
            : 0;
        return (
          <li key={unit.id}>
            <Card
              className={unit.locked ? "opacity-90" : "ring-1 ring-primary/15"}
              size="sm"
            >
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-heading text-lg leading-snug">
                    {unit.title}
                  </CardTitle>
                  {unit.locked ? (
                    <Badge variant="secondary" className="shrink-0 gap-1">
                      <Lock className="size-3" aria-hidden />
                      Locked
                    </Badge>
                  ) : (
                    <Badge variant="default" className="shrink-0">
                      Available
                    </Badge>
                  )}
                </div>
                <CardDescription>{unit.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen
                    className="size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>
                    {unit.completedCount} / {unit.lessonCount} lessons completed
                  </span>
                </p>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${unit.title} progress`}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Progress is saved when you pass a lesson with Good or Excellent.
              </CardFooter>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

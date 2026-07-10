import { Icon } from "@iconify/react";

interface CommunityStat {
  label: string;
  icon: string;
  iconClass: string;
  value: string;
  sub?: string;
}

interface CommunityStatsProps {
  stats: [CommunityStat, CommunityStat, CommunityStat, CommunityStat];
}

export function CommunityStats({ stats }: CommunityStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            <Icon icon={stat.icon} className={`size-5 ${stat.iconClass}`} />
          </div>
          <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
          {stat.sub && <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>}
        </div>
      ))}
    </div>
  );
}

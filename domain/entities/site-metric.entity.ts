export interface SiteMetric {
  readonly id: string;
  readonly totalVisits: number;
  readonly dailyVisits: number;
  readonly date: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

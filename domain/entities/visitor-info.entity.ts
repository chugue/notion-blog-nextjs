export interface VisitorInfo {
  id: string;
  ipHash: string;
  userAgent: string;
  date: Date;
  visitedPathnames: string[];
  createdAt: Date;
  updatedAt: Date;
}

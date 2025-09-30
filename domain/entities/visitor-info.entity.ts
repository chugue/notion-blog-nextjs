export interface VisitorInfo {
  id: string;
  ipHash: string;
  userAgent: string;
  date: string;
  visitedPathnames: string[];
  createdAt: Date;
  updatedAt: Date;
}

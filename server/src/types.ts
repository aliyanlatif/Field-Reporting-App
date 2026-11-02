export interface ReportRecord {
  id: string;
  description: string;
  imageIds: string[];
  createdAt: string;
  completedAt: string | null;
}

export interface ReportImageView {
  id: string;
  url: string;
}

export interface ReportView {
  id: string;
  description: string;
  createdAt: string;
  completedAt: string;
  images: ReportImageView[];
}

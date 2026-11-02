export interface CreateReportRequest {
  id: string;
  description: string;
  imageIds: string[];
  createdAt: string;
}

export interface ImageUpload {
  id: string;
  uri: string;
  sizeBytes: number;
}

export interface RemoteImage {
  id: string;
  url: string;
}

export interface RemoteReport {
  id: string;
  description: string;
  createdAt: string;
  completedAt: string;
  images: RemoteImage[];
}

export interface ReportsApi {
  createReport(request: CreateReportRequest): Promise<void>;
  uploadImage(reportId: string, image: ImageUpload): Promise<void>;
  completeReport(reportId: string): Promise<void>;
  listReports(): Promise<RemoteReport[]>;
  getReport(reportId: string): Promise<RemoteReport>;
  deleteAllReports(): Promise<void>;
}

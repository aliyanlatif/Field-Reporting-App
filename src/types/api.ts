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
  /** `onProgress` receives the fraction (0 to 1) of the image's bytes handed to the network. */
  uploadImage(
    reportId: string,
    image: ImageUpload,
    onProgress?: (fraction: number) => void,
  ): Promise<void>;
  completeReport(reportId: string): Promise<void>;
  listReports(): Promise<RemoteReport[]>;
  getReport(reportId: string): Promise<RemoteReport>;
  /** Idempotent: deleting a report the server no longer holds is not an error. */
  deleteReport(reportId: string): Promise<void>;
  deleteAllReports(): Promise<void>;
}

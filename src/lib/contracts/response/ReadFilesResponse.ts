export interface ReadFilesResponse {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    error?: string;
  }>;
}

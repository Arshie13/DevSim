export interface FileListResponse {
  success: boolean;
  files: Array<string>;
  directories?: Array<string>;
}
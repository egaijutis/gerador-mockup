export enum AppStep {
  UPLOAD_BASE = 0,
  UPLOAD_LOGO = 1,
  DESCRIBE = 2,
  GENERATING = 3,
  RESULT = 4
}

export interface MockupState {
  baseImage: string | null; // Base64 string
  logoImage: string | null; // Base64 string
  mockupType: string;
  description: string;
  generatedImage: string | null;
  error: string | null;
}

export interface FileData {
  name: string;
  url: string;
}
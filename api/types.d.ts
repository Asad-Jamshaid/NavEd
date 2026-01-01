// Type declarations for API dependencies
declare module '@vercel/node' {
  export interface VercelRequest {
    method?: string;
    body?: any;
    query?: any;
  }
  export interface VercelResponse {
    status: (code: number) => VercelResponse;
    json: (data: any) => void;
  }
}

declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: any;
  }
  function pdf(buffer: Buffer): Promise<PDFData>;
  export default pdf;
}


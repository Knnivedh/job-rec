declare module 'pdf-parse' {
  function pdf(buffer: Buffer, options?: any): Promise<{ text: string; numpages: number; info: any; metadata: any; version: string }>
  export = pdf
}
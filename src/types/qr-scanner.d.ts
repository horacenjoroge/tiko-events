declare module 'qr-scanner' {
    export default class QrScanner {
      constructor(
        videoElement: HTMLVideoElement,
        onDecode: (result: string) => void,
        options?: {
          highlightScanRegion?: boolean;
          highlightCodeOutline?: boolean;
          preferredCamera?: 'user' | 'environment';
        }
      );
      
      start(): Promise<void>;
      stop(): void;
      destroy(): void;
      
      static hasCamera(): Promise<boolean>;
      static scanImage(imageOrCanvas: HTMLImageElement | HTMLCanvasElement): Promise<string>;
    }
  }
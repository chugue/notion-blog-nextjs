declare module 'locomotive-scroll' {
  interface DeviceOptions {
    smooth?: boolean;
    breakpoint?: number;
  }

  interface Options {
    el: HTMLElement;
    smooth?: boolean;
    smartphone?: DeviceOptions;
    tablet?: DeviceOptions;
    getDirection?: boolean;
  }

  class LocomotiveScroll {
    constructor(opts: Options);
    update(): void;
    destroy(): void;
    on(event: string, cb: (...args: any[]) => void): void;
    off(event: string, cb?: (...args: any[]) => void): void;
  }

  export default LocomotiveScroll;
}

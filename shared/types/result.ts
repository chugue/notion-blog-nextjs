export type Result<T, E = Error> =
  | { success: true; data: T }
  | {
      success: false;
      error: E;
      statusCode?: number;
      message?: string;
    };

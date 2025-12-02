export interface AppConfig{
    port: number,
    nodeEnv: string
}


export interface AppError extends Error {
  status?: number;
}
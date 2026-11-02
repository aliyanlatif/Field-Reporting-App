export const config = {
  port: Number(process.env.PORT ?? 4000),
  maxImageBytes: 5 * 1024 * 1024,
  maxImagesPerReport: 5,
  dataDir: process.env.DATA_DIR ?? 'data',
};

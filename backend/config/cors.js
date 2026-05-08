const CorsConfig = {
  origin: [
    process.env.URL_FRONTEND,
    "http://localhost:4200",
    "http://localhost:3000",
  ],
  credentials: true,
};

export default CorsConfig;

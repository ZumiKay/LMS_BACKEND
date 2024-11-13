declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    DB_HOST: string;
    DB_USER: string;
    DB_PASS: string;
    DB_NAME: string;
    DB_STRING: string;
    EMAIL: string;
    EMAIL_PASS: string;
    JWT_SECRET: string;
    REFRESH_JWT_SECRET: string;
    GOOGLEBOOK_APIKEY: string;
    ACCESSTOKEN_LIFE: string;
    REFRESHTOKEN_LIFE: string;
    ACCESSTOKEN_COOKIENAME: string;
    REFRESHTOKEN_COOKIENAME: string;
    EMAIL_KEY: string;
    EMAIL: string;
    BLOB_READ_WRITE_TOKEN: string;
    PARAGONIU_URL: string;
    PORT?: string;
  }
}

import dotEnv from "dotenv";
dotEnv.config();

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
  console.log(`Using environment variables from ${configFile}`);
} else {
  dotEnv.config();
}

export default {
  PORT: process.env.PORT,
  DB_URL: process.env.DATABASE_URL,
  APP_SECRET: process.env.APP_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
};

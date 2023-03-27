import { createServer } from "http";
import { createApplication } from "./app";
import { Sequelize } from "sequelize";
import pg from "pg";
import { PostgresTodoRepository } from "./todo-management/todo.repository";

const httpServer = createServer();

const sequelize = new Sequelize("postgres", "postgres", "changeit", {
  dialect: "postgres",
});

const connectionPool = new pg.Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
});

createApplication(
  httpServer,
  {
    connectionPool,
    todoRepository: new PostgresTodoRepository(sequelize),
  },
  {
    cors: {
      origin: ["http://localhost:4200"],
    },
  }
);

const main = async () => {
  // create the tables if they do not exist already
  await sequelize.sync();

  // create the table needed by the postgres adapter
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS socket_io_attachments (
        id          bigserial UNIQUE,
        created_at  timestamptz DEFAULT NOW(),
        payload     bytea
    );
  `);

  // uncomment when running in standalone mode
  // httpServer.listen(3000);
};

main();

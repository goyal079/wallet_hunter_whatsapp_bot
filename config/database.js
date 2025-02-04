"use strict";

const Sequelize = require("sequelize");
const config = require("./db.config"); // Now referring to separate config file

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];
let sequelize;
if (process.env.DB_URL) {
  // Production/Render configuration
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
} else {
  // Local development configuration
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      pool: dbConfig.pool,
      define: dbConfig.define,
      logging: dbConfig.logging,
    }
  );
}

// Initialize db object
const db = {};

// Import models
const Samaj = require("../app/models/samaj.model")(sequelize, Sequelize);
const Family = require("../app/models/family.model")(sequelize, Sequelize);
const Member = require("../app/models/member.model")(sequelize, Sequelize);
const Conversation = require("../app/models/conversation.model")(
  sequelize,
  Sequelize
);

// Add models to db object
db.Samaj = Samaj;
db.Family = Family;
db.Member = Member;
db.Conversation = Conversation;

// Initialize associations
Samaj?.associate(db);
Family?.associate(db);
Member?.associate(db);

// Database connection test
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Sync models with database (commented by default)
// Uncomment when schema changes are made
// sequelize.sync({
//     alter: true
//     // force: true // Use force:true to recreate tables (CAREFUL: drops existing tables!)
// });

module.exports = {
  db,
  Samaj,
  Family,
  Member,
  Conversation,
  sequelize,
};

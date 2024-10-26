"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_ROLE" AS ENUM('STUDENT', 'HEADDEPARTMENT' , 'LIBRARIAN');
    `);

    await queryInterface.changeColumn("Users", "role", {
      type: "enum_ROLE",
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.STRING, // Use the original type here (e.g., STRING)
      allowNull: false,
    });

    // Step 2: Drop the enum type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_ROLE";
    `);
  },
};

const { NotFoundError } = require("../expressError");
const db = require("../db");


class Company {
  constructor(code, name, description) {

    this.code = code;
    this.name = name;
    this.description = description;
    this.add();
  }

  /** Return a list of all companies in database { companies: [{}, {}] } */
  static async findAll() {
    const result = await db.query(
      `SELECT code, name
        FROM companies`);

    const companies = result.rows;

    return companies;
  }
  /** Find a company, throw an error if unsuccessful.  */
  static async find(code) {
    const result = await db.query(
      `SELECT code, name, description FROM companies
        WHERE code = $1`, [code]
    );
    const company = result.rows[0];
    if (!company) throw new NotFoundError("Company code not found.");

    return company;
  }

/** Update a company. */
  static async update(name, description, code) {

    await this.find(code);

    const result = await db.query(
      `UPDATE companies
        SET name = $1
        description = $2
        WHERE code = $3
        RETURNING code, name, description`, [name, description, code]
    );
    const company = result.rows[0];

    return company;
  }

  /** Delete a company. */
  static async delete(code) {

    await this.find(code);

    const results = await db.query(
      `DELETE from companies
      WHERE code = $1`, [code]);
  }

  /** Add a company to database */
  async add() {

    const results = await db.query(
      `INSERT INTO companies (code, name, description)
        VALUES($1, $2, $3)`,
      [this.code, this.name, this.description]);
  }
}

module.exports = Company;
const { NotFoundError } = require("../expressError");
const db = require("../db");

class Invoice {

  constructor(compCode, amt) {

    this.compCode = compCode;
    this.amt = amt;
    this.add();

  }

  /** Return a list of all invoices in database { invoices: [{}, {}] } */
  static async findAll() {
    const result = await db.query(
      `SELECT id, comp_code
        FROM invoices`);

    const invoices = result.rows;

    return invoices;
  }
  /** Find an invoice , throw an error if unsuccessful.  */
  static async find(id) {

    const result = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code AS company
        FROM invoices
        WHERE id = $1`, [id]);

    const invoice = result.rows[0];

    if (!invoice) throw new NotFoundError("Company code not found.");

    return invoice;
  }

  /** Update an invoice and return it. */
  static async update(amt, id) {

    await this.find(id);

    const result = await db.query(
      `UPDATE invoices
        SET amt = $1
        WHERE id = $2
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, id]);

    const invoice = result.rows[0];

    return invoice;
  }

  /** Delete a company. */
  static async delete(id) {

    await this.find(id);

    const response = await db.query(
      `DELETE FROM invoices
        WHERE id = $1`, [id]);
  }

  /** Add a company to database */
  static async add(compCode, amt) {

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [compCode, amt]);

    const invoice = result.rows[0];

    return invoice;
  }
}


module.exports = Invoice;
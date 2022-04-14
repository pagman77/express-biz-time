"use strict";

const express = require('express');
const app = require('../app');
const db = require('../db.js');
const { NotFoundError } = require('../expressError');
const router = new express.Router();

/** Return info on all invoices. */
router.get("/", async (req, res) => {
  const response = await db.query(
    `SELECT id, comp_code
      FROM invoices`);

  const invoices = response.rows;

  return res.json({ invoices });
});

/** Return info on invoice. */
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const invResponse = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code AS company
      FROM invoices
      WHERE id = $1`, [id]);
  // USE JOIN
  const invoice = invResponse.rows[0];

  if (!invoice) {
    throw new NotFoundError("Invoice does not exist");
  }
  const compCode = invoice.company;

  const compResponse = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [compCode]);

  const company = compResponse.rows[0];

  invoice.company = company;

  return res.json({ invoice });
});

/** Create a new invoice. */
router.post("/", async (req, res) => {
  const { comp_code, amt } = req.body;

  const response = await db.query(
    `INSERT INTO invoices (comp_code, amt)
    VALUES ($1, $2)
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]);

  const invoice = response.rows[0];

  return res.status(201).json({ invoice });
});

/** Update an existing invoice. */
router.put("/:id", async (req, res) => {
  const amt = req.body.amt;
  const id = req.params.id;

  const response = await db.query(
    `UPDATE invoices
  SET amt = $1
  WHERE id = $2
  RETURNING id, comp_code, amt, paid, add_date, paid_date
  `, [amt, id]);

  const invoice = response.rows[0];

  if (!invoice) {
    throw new NotFoundError("ID does not exist.");
  }
  return res.json({ invoice });
});

/** Delete invoice. */
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const response = await db.query(
    `DELETE FROM invoices
    WHERE id = $1
    RETURNING id`, [id]);

  const invoice = response.rows[0];

  if (!invoice) {
    throw new NotFoundError("ID does not exist.");
  }

  return res.json({ "status": "deleted" });
});

module.exports = router;
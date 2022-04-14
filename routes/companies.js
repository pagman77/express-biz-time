"use strict"

const express = require('express');
const app = require('../app');
const db = require('../db.js');
const { NotFoundError } = require('../expressError');
const router = new express.Router();

/** Get the list of companies */
router.get("/", async function (req, res) {
  const results = await db.query(
    'SELECT code, name, description FROM companies'
  );
  return res.json({ companies: results.rows });
});

router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description FROM companies
      WHERE code = $1`, [code]
    );

  if (results.rows[0] === undefined) {
    throw new NotFoundError("Company code not found.");
  }
  return res.json({ company: results.rows[0] });

});

router.post("/", async function (req, res) {
  const { code, name, description } = req.body;
  const results = await db.query(
    `INSERT INTO companies (code, name, description)
      VALUES($1, $2, $3)
      RETURNING code, name, description`,
    [code, name, description]
  );
  return res.status(201).json({ company: results.rows[0] });
});

router.put("/:code", async function (req, res) {
  const { name, description } = req.body;
  const code = req.params.code;

  const results = await db.query(
    `UPDATE companies
    SET name = $1,
    description = $2
      WHERE code = $3 RETURNING code, name, description`, [name, description, code]
  );

  if (results.rows[0] === undefined) {
    throw new NotFoundError("Company code not found.");
  }
  return res.json({ company: results.rows[0] });
});

router.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const item = await db.query(
    `SELECT code, name, description FROM companies
      WHERE code = $1`, [code]
  );

  if (item.rows[0] === undefined) {
    throw new NotFoundError("Company code not found.");
  }
  // If company code found, delete the company

  const results = await db.query(
    `DELETE from companies
      WHERE code = $1`, [code]
    );

  return res.json({ message: "Successfully deleted." });
});

module.exports = router;
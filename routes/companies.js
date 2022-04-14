"use strict";

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
  const companies = results.rows;
  return res.json({ companies });
});

router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description FROM companies
      WHERE code = $1`, [code]
  );
  const company = results.rows[0];
  if (!company) {
    throw new NotFoundError("Company code not found.");
  }
  return res.json({ company });
});

router.post("/", async function (req, res) {
  const { code, name, description } = req.body;
  const results = await db.query(
    `INSERT INTO companies (code, name, description)
      VALUES($1, $2, $3)
      RETURNING code, name, description`,
    [code, name, description]
  );
  const company = results.rows[0];
  return res.status(201).json({ company });
});

router.put("/:code", async function (req, res) {
  const { name, description } = req.body;
  const code = req.params.code;

  const results = await db.query(
    `UPDATE companies
      SET name = $1
      description = $2
      WHERE code = $3
      RETURNING code, name, description`, [name, description, code]
  );
  const company = results.rows[0];
  if (!company) {
    throw new NotFoundError("Company code not found.");
  }
  return res.json({ company });
});

router.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `DELETE from companies
    WHERE code = $1
    RETURNING code`, [code]
    );
  const company = results.rows[0];

    if (!company) {
      throw new NotFoundError("Company code not found.");
    }
  return res.json({ message: "Successfully deleted." });
});

module.exports = router;
"use strict";

const express = require('express');
const app = require('../app');
const router = new express.Router();
const Company = require("../models/company");
const Invoice = require("../models/invoice");

/** Return list of companies */
router.get("/", async (req, res) => {

  return res.json(await Company.findAll());
});
/** Return a single company */
router.get("/:code", async (req, res) => {

  const company = await Company.find(req.params.code);
  const compCode = company.code;

  const invoices = await Invoice.findAll();
  company.invoices = invoices;

  return res.json({ company });
});
/** Post a new company, return company. */
router.post("/", async (req, res) => {

  const { code, name, description } = req.body;
  const company = await new Company(code, name, description);

  return res.status(201).json({ company });
});

/** Update and return company. */
router.put("/:code", async (req, res) => {

  const { name, description } = req.body;
  const company = await Company.find(req.params.code);
  const updatedCompany = await Company.update(name, description, company.code);

  return res.json({ company: updatedCompany });
});

/** Delete company, return message. */
router.delete("/:code", async (req, res) => {
  const code = req.params.code;
  await Company.delete(code);

  return res.json({ message: "Successfully deleted." });
});

module.exports = router;
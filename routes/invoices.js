"use strict";

const express = require('express');
const app = require('../app');
const Invoice = require('../models/invoice');
const Company = require("../models/company")
const router = new express.Router();

/** Return info on all invoices. */
router.get("/", async (req, res) => {

  const invoices = await Invoice.findAll()

  return res.json({ invoices });
});

/** Return info on invoice. */
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const invoice = await Invoice.find(id);
  const compCode = invoice.company;
  const company = Company.find(compCode);

  invoice.company = company;

  return res.json({ invoice });
});

/** Create a new invoice. */
router.post("/", async (req, res) => {
  const { comp_code, amt } = req.body;

  const invoice = await Invoice.add(comp_code, amt);

  return res.status(201).json({ invoice });
});

/** Update an existing invoice. */
router.put("/:id", async (req, res) => {
  const amt = req.body.amt;
  const id = req.params.id;
  const invoice = await Invoice.update(amt, id);

  return res.json({ invoice });
});

/** Delete invoice. */
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await Invoice.delete(id);

  return res.json({ "status": "deleted" });
});

module.exports = router;
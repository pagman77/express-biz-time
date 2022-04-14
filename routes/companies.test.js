"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");


let testComp;
let testInv;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  const compResult = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple', 'Test')
    RETURNING code, name, description`);
  testComp = compResult.rows[0];


  await db.query("DELETE FROM invoices");
  const invResult = await db.query(
    `INSERT INTO invoices (comp_code, amt)
     VALUES ('apple', 500)
     RETURNING id`
  )
  testInv = invResult.rows[0].id;
});

afterEach(async function () {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");
});


/** GET /companies - returns {companies: [{code, name}, ...]} */
describe("GET /companies", () => {
  test("Get a list of companies", async () => {
    const resp = await request(app).get('/companies');

    expect(resp.body).toEqual({ companies: [testComp] });
    expect(resp.statusCode).toEqual(200);
  });
});

/** GET /companies/[code] - returns {company: {code, name, description} */
describe("GET /companies/code", () => {
  test("Get a specific code", async () => {
    const resp = await request(app).get(`/companies/${testComp.code}`);
    debugger;
    testComp.invoices = [testInv];

    expect(resp.body).toEqual({ company: testComp });
    expect(resp.statusCode).toEqual(200);
  });

  test("Not Found Error", async () => {
    const resp = await request(app).get(`/companies/bananas`);

    expect(resp.statusCode).toEqual(404);
  });
})

/** POST /companies - returns {company: {code, name, description}} */
describe("POST /companies", () => {
  test("Add a company", async () => {
    const resp = await request(app)
      .post('/companies')
      .send({
        code: "bananas", name: "Bananas", description: "More bananas"
      });

    expect(resp.body).toEqual({ company: { code: "bananas", name: "Bananas", description: "More bananas" } });
    expect(resp.statusCode).toEqual(201);
  });
})
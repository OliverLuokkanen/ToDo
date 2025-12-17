import { expect } from "chai";
import request from "supertest";
import dotenv from "dotenv";
import app from "../index.js";
import {
  initializeTestDb,
  insertTestUser,
  createTokenForUser
} from "./testHelper.js";

dotenv.config();

describe("Authentication and protected Todo API", function () {
  this.timeout(10000);

  let testUser;
  let token;

  before(async () => {
    process.env.NODE_ENV = "test";
    await initializeTestDb();
    testUser = await insertTestUser("authuser@example.com", "secret123");
  });

  describe("POST /user/signup", () => {
    it("creates a new user and returns 201 + id/email", async () => {
      const res = await request(app)
        .post("/user/signup")
        .send({ email: "newuser@example.com", password: "password" });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("email", "newuser@example.com");
    });

    it("returns 409 for duplicate email", async () => {
      const res = await request(app)
        .post("/user/signup")
        .send({ email: "newuser@example.com", password: "password" });

      expect(res.status).to.equal(409);
      expect(res.body).to.have.nested.property("error.message");
    });

    it("returns 400 when missing fields", async () => {
      const res = await request(app).post("/user/signup").send({ email: "" });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.nested.property("error.message");
    });
  });

  describe("POST /user/signin", () => {
    it("signs in existing user and returns token", async () => {
      const res = await request(app)
        .post("/user/signin")
        .send({ email: "authuser@example.com", password: "secret123" });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("email", "authuser@example.com");
      expect(res.body).to.have.property("token");

      token = res.body.token;
    });

    it("returns 401 on wrong password", async () => {
      const res = await request(app)
        .post("/user/signin")
        .send({ email: "authuser@example.com", password: "wrong" });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.nested.property("error.message");
    });
  });

  describe("Protected Todo routes", () => {
    it("allows GET / without token", async () => {
      const res = await request(app).get("/");
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
    });

    it("rejects POST /create without token", async () => {
      const res = await request(app)
        .post("/create")
        .send({ description: "Should fail" });

      expect(res.status).to.equal(401).or.to.equal(403);
      expect(res.body).to.have.nested.property("error.message");
    });

    it("creates a task with valid Bearer token", async () => {
      const res = await request(app)
        .post("/create")
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "Protected task" });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("description", "Protected task");
    });

    it("deletes a task with valid token", async () => {
      // Luo ensin
      const createRes = await request(app)
        .post("/create")
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "Task to delete" });

      const idToDelete = createRes.body.id;

      const deleteRes = await request(app)
        .delete(`/delete/${idToDelete}`)
        .set("Authorization", token); // myös pelkkä token toimii

      expect(deleteRes.status).to.equal(200);
      expect(deleteRes.body).to.have.property("id", idToDelete);
    });

    it("returns 404 when deleting non-existing id", async () => {
      const res = await request(app)
        .delete("/delete/999999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.nested.property("error.message");
    });
  });
});
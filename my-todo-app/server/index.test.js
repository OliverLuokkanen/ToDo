import request from "supertest";
import { expect } from "chai";
import app from "./index.js";
import { createTestToken } from "./testUtils.js";

const token = createTestToken();

describe("Todo backend REST API", () => {
  let createdId = null;

  it("GET / palauttaa tehtävälistan (200) ja taulukon, jossa on id ja description", async () => {
    const res = await request(app).get("/");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    for (const item of res.body) {
      expect(item).to.have.property("id");
      expect(item).to.have.property("description");
    }
  });

  it("POST /create luo uuden tehtävän (201) ja palauttaa id + description", async () => {
    const res = await request(app)
      .post("/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Test task" });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("description", "Test task");
    createdId = res.body.id;
  });

  it("DELETE /delete/:id poistaa aiemmin luodun tehtävän (200)", async () => {
    const res = await request(app)
      .delete(`/delete/${createdId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("id", createdId);
  });

  it("POST /create ilman description-kenttää palauttaa 400 ja error-avaimen", async () => {
    const res = await request(app)
      .post("/create")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("DELETE /delete/:id olemattomalla id:llä palauttaa 404 ja error-avaimen", async () => {
    const res = await request(app)
      .delete("/delete/999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("error");
  });
});
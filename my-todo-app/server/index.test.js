import { expect } from "chai";

const BASE_URL = "http://localhost:3001";

/**
 * Apufunktio: lukee JSONin ja lisää hieman debug-tietoa virhetilanteissa.
 */
async function parseJsonOrThrow(res) {
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error(
      `Response is not valid JSON (status ${res.status}): ${text}`
    );
  }

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} returned error body: ${JSON.stringify(json)}`
    );
  }

  return json;
}

describe("Todo backend REST API", function () {
  // Lisää hieman aikaa verkko- ja tietokantaoperaatioille
  this.timeout(10000);

  let createdTaskId = null;

  before(async () => {
    // Varmistetaan, että palvelin vastaa ennen testejä
    const res = await fetch(`${BASE_URL}/`);
    expect(res.status).to.equal(200);

    const data = await parseJsonOrThrow(res);
    expect(data).to.be.an("array");
  });

  //
  // 1) GET / — listaa tehtävät
  //
  it("GET / palauttaa tehtävälistan (200) ja taulukon, jossa on id ja description", async () => {
    const res = await fetch(`${BASE_URL}/`);
    expect(res.status).to.equal(200);

    const data = await parseJsonOrThrow(res);
    expect(data).to.be.an("array");

    // Ympäristössä voi olla tyhjäkin lista, mutta siemen-datalla oletuksena ei-tyhjä
    if (data.length > 0) {
      const first = data[0];
      expect(first).to.be.an("object");
      expect(first).to.have.property("id");
      expect(first).to.have.property("description");
    }
  });

  //
  // 2) POST /create — luo uuden tehtävän
  //
  it("POST /create luo uuden tehtävän (201) ja palauttaa id + description", async () => {
    const body = { description: "Test task from automated tests" };

    const res = await fetch(`${BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    expect(res.status).to.equal(201);

    const data = await parseJsonOrThrow(res);
    expect(data).to.be.an("object");
    expect(data).to.have.property("id");
    expect(data).to.have.property("description", body.description);

    // Talletetaan id myöhempää poistoa ja negatiivista testiä varten
    createdTaskId = data.id;
  });

  //
  // 3) DELETE /delete/:id — poistaa juuri luodun tehtävän
  //
  it("DELETE /delete/:id poistaa aiemmin luodun tehtävän (200)", async () => {
    expect(createdTaskId).to.not.equal(null);

    const res = await fetch(`${BASE_URL}/delete/${createdTaskId}`, {
      method: "DELETE"
    });

    expect(res.status).to.equal(200);

    const data = await parseJsonOrThrow(res);
    expect(data).to.be.an("object");
    expect(data).to.have.property("id", createdTaskId);
  });

  //
  // 4) NEGATIIVINEN: POST /create ilman kuvausta
  //
  it("POST /create ilman description-kenttää palauttaa 400 ja error-avaimen", async () => {
    const res = await fetch(`${BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({}) // virheellinen runko
    });

    expect(res.status).to.equal(400);

    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      throw new Error(
        `Expected JSON error body from POST /create 400, got: ${text}`
      );
    }

    expect(json).to.be.an("object");
    expect(json).to.have.property("error");
  });

  //
  // 5) NEGATIIVINEN: DELETE /delete/:id olemattomalla id:llä
  //
  it("DELETE /delete/:id olemattomalla id:llä palauttaa 404 ja error-avaimen", async () => {
    // Käytetään samaa createdTaskId:tä uudestaan, joka on jo poistettu
    const missingId = createdTaskId ?? 999999;

    const res = await fetch(`${BASE_URL}/delete/${missingId}`, {
      method: "DELETE"
    });

    expect(res.status).to.equal(404);

    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      throw new Error(
        `Expected JSON error body from DELETE /delete/:id 404, got: ${text}`
      );
    }

    expect(json).to.be.an("object");
    expect(json).to.have.property("error");
  });
});
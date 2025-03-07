import request from "supertest";
import { prisma } from "../jest.setup";
import { app } from "../src/app";

describe("GET /api/v1/", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create an alias", async () => {
    const response = await request(app)
      .post("/api/v1/short")
      .send({ longURL: "www.google.com", customAlias: "myurl" });

    expect(response.status).toBe(201);

    const output = await prisma.alias.findUnique({
      where: { alias: "myurl" },
    });
    console.log(output);
  });

  it("should redirect alias", async () => {
    const response = await request(app).get("/api/v1/myurl");

    expect(response.status).toBe(301);
  });
});

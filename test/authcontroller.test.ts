import request from "supertest";
import app  from "../src/app";

describe("auth endpoints", () => {
    const testServer = request(app)
    it("tests registeration with valid credentials", async () => {
        console.log("testserver: %s", testServer);
    })
})
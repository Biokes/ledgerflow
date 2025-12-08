import request from "supertest";
import app  from "../src/app";
import { password } from "pg/lib/defaults";

describe("auth endpoints", () => {
    const testServer = request(app)
    it("tests invalid credentials registerations", async () => {
        const userDetails = { name: '', password: '', email: ',aol' };
        const res = await testServer.post('/api/v1/auths/register')
        expect(res.status).toEqual(400)
        expect(res.body).toHaveProperty('data')
        expect(res.body.success).toEqual(false)
    })
})
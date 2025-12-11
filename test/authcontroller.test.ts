import request from "supertest";
import app  from "../src/app";
import { password } from "pg/lib/defaults";

describe("auth/register endpoint", () => {

    const testServer = request(app)

    it("tests no credentials for registerations", async function() {
        const res = await testServer.post('/api/v1/auths/register')
        expect(res.status).toEqual(400)
        expect(res.body).toHaveProperty('data')
        expect(res.body.success).toEqual(false)
    })

    it("tests invalid credentials for registeration", async function () {
        await testServer.post('/api/v1/auths/register')
            .send( { name: '', password: '', email: ',aol' })
            .expect(400)
        await testServer.post('/api/v1/auths/register')
            .send( { name: 'kals', password: 'passkey', email: ',aol' })
            .expect(400)
    })
    it("tests invalid credentials for registeration", async function () {
        await testServer.post('/api/v1/auths/register')
            .send( { name: '', password: '', email: ',aol' })
            .expect(400)
        await testServer.post('/api/v1/auths/register')
            .send( { name: 'kals', password: 'passkey', email: ',aol' })
            .expect(400)
        await testServer.post('/api/v1/auths/register')
            .send( { name: 'kals', password: 'passkey', email: 'mail@gmail.com' })
            .expect(400)
    })
    it("tests valid credentials signup profile", async function () { 
        const res = await testServer.post("/api/v1/auths/register")
            .send({ name: "dora hacks", password: "Password1234,", email: "mail@email.com" })
            .expect(201)
    })
})
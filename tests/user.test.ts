import { POST } from "@/app/api/v1/user/route";
import { NextRequest } from "next/server";
import { createMocks } from "node-mocks-http";
import bcrypt from "bcrypt";
import { prisma } from "@/prisma/prisma";

describe("api/v1/user", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: "jane@mail.com" } });
  });
  it("Dados insuficientes", async () => {
    const { req } = createMocks({
      method: "POST",
      body: {
        name: "Jane Doe",
      },
      url: "api/v1/user",
    });
    const nextReq = new NextRequest(`http://localhost${req.url}`, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const response = await POST(nextReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ message: "Dados insuficientes" });
  });
  it("Sucesso no cadastro", async () => {
    const { req } = createMocks({
      method: "POST",
      body: {
        name: "Jane Doe",
        email: "jane@mail.com",
        password: "12345",
        username: "janeDoe",
      },
      url: "api/v1/user",
    });

    const nextReq = new NextRequest(`http://localhost${req.url}`, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const response = await POST(nextReq);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({
      id: expect.any(String),
      name: expect.any(String),
    });
  });
  it("Hash de senha", async () => {
    const passwordPlain = "12345"; // armazena a senha em uma variável

    const request = new NextRequest("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@mail.com",
        password: passwordPlain,
        username: "janeDoe",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201); // espera 201 Created

    const data = await response.json();

    // A senha NÃO deve estar no response
    expect(data).not.toHaveProperty("password");

    // Consultar o usuário direto no banco para verificar o hash
    const userInDb = await prisma.user.findUnique({
      where: { email: "jane@mail.com" },
    });

    expect(userInDb).not.toBeNull();

    // A senha do banco NÃO deve ser igual à senha pura
    expect(userInDb?.password).not.toBe(passwordPlain);

    // Verificar se a senha no banco é um hash válido
    const isValidHash = await bcrypt.compare(passwordPlain, userInDb!.password);
    expect(isValidHash).toBe(true);
  });
  
});

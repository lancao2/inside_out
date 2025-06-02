import { PrismaClient } from '@prisma/client';
import { testApiHandler } from 'next-test-api-route-handler';
import { GET } from '../app/api/v1/status/route'; // ajuste o path conforme seu projeto


const prisma = new PrismaClient();

export interface Pages {
    name: string,
    route: string,
    status: string,
}

describe("Conexão com o banco de dados", () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("Okay", async () => {
        await expect(prisma.$connect()).resolves.not.toThrow();
    });
});


describe('GET /api/v1/status', () => {
    it('Okay', async () => {
        await testApiHandler({
            appHandler: { GET },
            test: async ({ fetch }) => {
                const res = await fetch();
                expect(res.status).toBe(200);
                const json = await res.json();
                expect(json).toMatchObject({
                    date: expect.any(String),
                    status: expect.any(String),
                    version: expect.any(String),
                    services: {
                        database: {
                            status: expect.stringMatching(/^(connected|disconnected|error)$/),
                            latency: expect.any(Number),
                            engine: expect.any(String),
                            totalConnections: expect.any(String),
                        },
                        pages: expect.arrayContaining([
                            expect.objectContaining({
                                name: expect.any(String),
                                route: expect.any(String),
                                status: expect.any(String),
                            }),
                        ])
                    },
                    criated_by: "Alex Lanção"

                });
            },
        });
    });
});

import { Pages } from "@/tests/dbConection.test";
import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function getDatabaseStatus(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    await prisma.$connect();
    return 'connected';
  } catch (error) {
    console.error('Erro ao conectar com o banco:', error);
    return 'error';
  } finally {
    await prisma.$disconnect();
  }
}

export async function getDatabaseLatency(): Promise<number | null> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`; 
    const end = Date.now();
    return end - start;
  } catch (error) {
    console.error('Erro ao medir a latência do banco:', error);
    return null;
  }
}

export function getDatabaseEngine(): string | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;

  const match = dbUrl.match(/^(\w+):\/\//);
  return match ? match[1] : null;
}

export async function getConnectionCount(): Promise<number | null> {
  try {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as total FROM information_schema.processlist;
    `);

    return result[0]?.total ?? null;
  } catch (err) {
    console.error('Erro ao obter número de conexões:', err);
    return null;
  }
}

export async function getMaxConnections(): Promise<number | null> {
  try {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      SHOW VARIABLES LIKE 'max_connections';
    `);

    // result exemplo: [{ Variable_name: 'max_connections', Value: '151' }]
    return result[0]?.Value ? Number(result[0].Value) : null;
  } catch (error) {
    console.error('Erro ao obter limite máximo de conexões:', error);
    return null;
  }
}

export function getPages(): Pages[] {
  const appDir = path.join(process.cwd(), 'app');
  const pageList: Pages[] = [];

  function walk(dir: string, baseRoute: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const routeSegment = entry.name === 'page.tsx' ? '' : entry.name;

      if (entry.isDirectory()) {
        walk(fullPath, path.join(baseRoute, routeSegment));
      } else if (entry.isFile() && entry.name === 'page.tsx') {
        const route = baseRoute.replace(/\\/g, '/') || '/';
        const name = route.split('/').pop() || 'index';

        let status = 'ok';

        try {
          // Verifica se o arquivo é válido para importação (evite usar require no App Router)
          fs.accessSync(fullPath, fs.constants.R_OK);
        } catch (e) {
          status = 'error';
        }

        pageList.push({
          name,
          route,
          status,
        });
      }
    }
  }

  walk(appDir);
  return pageList;
}
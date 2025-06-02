import { PrismaClient } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getConnectionCount, getDatabaseEngine, getDatabaseLatency, getDatabaseStatus, getMaxConnections, getPages } from './utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const date = new Date()
    const aplicationPages = getPages()
    return NextResponse.json({
        date: date,
        status: 'In development',
        version: '1.0.0',
        services: {
            database: {
                status: await getDatabaseStatus(),
                latency: await getDatabaseLatency(),
                engine: getDatabaseEngine(),
                totalConnections: `${await getConnectionCount()}/${await getMaxConnections()}`
            },
            pages: aplicationPages,
        },
        criated_by: "Alex Lanção"

    });
}


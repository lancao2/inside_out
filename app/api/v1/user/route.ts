import { prisma } from "@/prisma/prisma";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, username } = body as User;
    if (!name || !email || !password || !username) {
      return NextResponse.json(
        { message: "Dados insuficientes" },
        { status: 400 }
      );
    }
    const hashedpassword = await bcrypt.hash(password,10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedpassword,
        username,
      },
    });

    return NextResponse.json({ id: user.id, name: user.name }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

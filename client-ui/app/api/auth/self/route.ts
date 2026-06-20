import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(null, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/auth/self`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // Do not cache — always fresh session check
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(null, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}

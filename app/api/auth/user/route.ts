import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory user storage (in production, you'd use a real database)
const users = [
  {
    username: 'admin',
    password: 'password',
    state_id: 8,
    district_id: 104
  },
  {
    username: 'test',
    password: 'test123',
    state_id: 8,
    district_id: 104
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ message: 'Username is required.' }, { status: 400 });
    }

    const user = users.find(u => u.username === username);

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      state_id: user.state_id,
      district_id: user.district_id
    }, { status: 200 });
  } catch (error) {
    console.error('Fetch User Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
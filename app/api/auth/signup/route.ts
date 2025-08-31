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

export async function POST(req: NextRequest) {
  try {
    const { username, password, state_id, district_id } = await req.json();

    if (!username || !password || state_id === undefined || district_id === undefined) {
      return NextResponse.json({ message: 'Username, password, state_id, and district_id are required.' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    // Add new user
    users.push({
      username,
      password,
      state_id,
      district_id
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Signup Error:', error);
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
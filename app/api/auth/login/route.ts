// File: app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory user storage (in production, you'd use a real database)
const users = [
  {
    username: 'admin',
    password: 'password', // In production, use hashed passwords
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
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
    }
    
    // Find the user
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Login successful
    return NextResponse.json({ 
      message: 'Login successful',
      user: {
        username: user.username,
        state_id: user.state_id,
        district_id: user.district_id
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
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
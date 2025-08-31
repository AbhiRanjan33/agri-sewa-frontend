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

    if (!username || state_id === undefined || district_id === undefined) {
      return NextResponse.json({ message: 'Username, state_id, and district_id are required.' }, { status: 400 });
    }

    // Find the user to update
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Update the user
    users[userIndex] = {
      ...users[userIndex],
      state_id,
      district_id,
      ...(password && { password }) // Only update password if provided
    };

    return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Update User Error:', error);
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
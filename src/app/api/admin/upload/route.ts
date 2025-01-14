import { NextResponse } from 'next/server';
import connection from '@/db/config';
import User from '@/Models/userModels';

export async function POST(request: Request) {
    try {
       
        await connection();

        
        const users = await request.json();

        // Validate the input format
        if (!Array.isArray(users)) {
            return NextResponse.json(
                { message: 'Invalid data format.' },
                { status: 400 }
            );
        }

        // Remove  _id 
        const sanitizedUsers = users.map(user => {
            const { _id, ...rest } = user;
            return rest;
        });

        
        const result = await User.insertMany(sanitizedUsers);

        return NextResponse.json({
            message: 'Users uploaded successfully',
            result,
        });
    } catch (error) {
        console.error('Error inserting users:', error);

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * GOVERNANCE RULE: 
 * Staff cannot delete or edit a transaction after it's entered. 
 * ONLY the Admin can do any reversal or corrections.
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    
    // SECURITY CHECK: Extract user role from headers
    // This role is passed from your AuthContext during API calls
    const userRole = request.headers.get('x-user-role'); 

    if (userRole !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized', 
          details: 'Governance Violation: Only Admin can edit transactions after entry.' 
        },
        { status: 403 } // Forbidden
      );
    }

    // --- PROCEED WITH ADMIN CORRECTION ---
    console.log('Authorized Admin correction at:', path);
    return NextResponse.json({ 
      message: 'Transaction correction successful.', 
      path: path,
      status: 'success'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized', 
          details: 'Governance Violation: Only Admin can delete or reverse transactions.' 
        },
        { status: 403 } // Forbidden
      );
    }

    // --- PROCEED WITH ADMIN REVERSAL ---
    console.log('Authorized Admin reversal at:', path);
    return NextResponse.json({ 
      message: 'Transaction reversal successful.', 
      path: path,
      status: 'success'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy error', details: String(error) },
      { status: 500 }
    );
  }
}
import { auth } from '@/firebase/firebase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyIdToken } from '@/firebase/firebaseAdmin';

export const getUserToken = async () => {
    const user = auth.currentUser;
  
    if (user) {
      try {
        const idToken = await user.getIdToken();
        console.log("ID Token:", idToken);
        return idToken;
      } catch (error) {
        console.error("Error fetching ID token:", error);
        throw error;
      }
    } else {
      console.log("No user is logged in.");
      return null;
    }
  };


export const verifyToken = async (token: string) => {
  const decodedToken = await verifyIdToken(token);
  return decodedToken;
};


export async function middleware(req: NextRequest) {
    const token = await getUserToken();
  
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  
    try {
      const decodedToken = await verifyToken(token);
  
      const userRole = decodedToken.role;
  
      const url = req.nextUrl.clone();
  
      if (userRole === 'Requester') {
        url.pathname = '/requester/request-form';
        return NextResponse.redirect(url);
      } else if (userRole === 'Approval') {
        url.pathname = '/approval/incoming-request'; 
        return NextResponse.redirect(url);
      } else if (userRole === 'Checker') {
        url.pathname = '/checker/incoming-request'; 
        return NextResponse.redirect(url);
      } else if (userRole === 'Releaser') {
        url.pathname = '/releaser/incoming-request'; 
        return NextResponse.redirect(url);
      } else {
        url.pathname = '/403';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
    
  }
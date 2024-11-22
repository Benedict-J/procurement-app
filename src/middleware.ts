import { auth } from '@/firebase/firebase';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const getUserToken = async () => {
  const user = auth?.currentUser;

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

export async function middleware(request: NextRequest) {
  const token = await getUserToken();
  const urlObj = new URL(request.url);
  
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', urlObj.origin));
  }

  return NextResponse.next()
}
 
export const config = {
  matcher: ["/((?!auth/*|requester/*|api/send-email|.next/static|images/*).*)"],
};
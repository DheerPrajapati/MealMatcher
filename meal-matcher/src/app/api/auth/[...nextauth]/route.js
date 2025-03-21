
import NextAuth from 'next-auth';
import { options } from './options';

const handler = NextAuth(options);

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST };
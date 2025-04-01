// From tutorial --> https://www.youtube.com/watch?v=w2h54xz6Ndw&t=2062s&ab_channel=DaveGray

import NextAuth from 'next-auth';
import { options } from './options';

const handler = NextAuth(options);

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST };
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in session types to include the user ID
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

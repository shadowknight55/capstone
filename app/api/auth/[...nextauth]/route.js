import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        const client = await clientPromise;
        const usersCollection = client.db("school_portal").collection("users");
        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user || !user?.password) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      } else if (!token.role && token.email) {
        // Fetch role from DB if not present
        const client = await clientPromise;
        const usersCollection = client.db("school_portal").collection("users");
        const dbUser = await usersCollection.findOne({ email: token.email });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Only for Google sign-in
      if (account?.provider === 'google') {
        const client = await clientPromise;
        const usersCollection = client.db("school_portal").collection("users");
        let dbUser = await usersCollection.findOne({ email: user.email });
        if (!dbUser) {
          // Get role from localStorage via query param (not available server-side), fallback to 'student'
          let role = 'student';
          if (typeof window !== 'undefined') {
            role = localStorage.getItem('pendingRole') || 'student';
            localStorage.removeItem('pendingRole');
          } else if (profile?.hd === 'teacher.com') {
            // Optionally, use Google domain for teachers
            role = 'teacher';
          }
          await usersCollection.insertOne({
            name: user.name,
            email: user.email,
            role,
            createdAt: new Date(),
            provider: 'google',
          });
        }
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };
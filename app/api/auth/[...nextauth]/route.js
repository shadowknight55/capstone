import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          redirect_uri: "https://capstone-git-main-kareem-moores-projects.vercel.app/api/auth/callback/google"
        }
      },
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        console.log('LOGIN ATTEMPT:', credentials.email, credentials.password, 'FOUND USER:', user);
        console.log('HASH IN DB:', user?.password);
        console.log('BCRYPT TEST (direct):', await bcrypt.compare('admin123', user?.password));
        console.log('BCRYPT TEST (input):', await bcrypt.compare(credentials.password, user?.password));
        if (!user || !user?.password) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        console.log('PASSWORD VALID:', isPasswordValid);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
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
        token.id = user.id;
        token.role = user.role;
      } else if (!token.role && token.email) {
        // Fetch role from DB if not present
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async signIn({ user, account, profile, req }) {
      // Only for Google sign-in
      if (account?.provider === 'google') {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!dbUser) {
          // Get role from a temporary cookie instead of localStorage
          const cookieStore = req.cookies;
          const role = cookieStore.get('pendingRole')?.value || 'student';

          dbUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              role,
              emailVerified: true,
              status: 'active',
              provider: 'google',
            }
          });
        }

        // Set the user ID and role
        user.id = dbUser.id.toString();
        user.role = dbUser.role;
      }
      return true;
    }
  }
});

export { handler as GET, handler as POST };
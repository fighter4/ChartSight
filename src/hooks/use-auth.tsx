'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

const FirebaseNotConfigured = () => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="max-w-xl bg-card/50 backdrop-blur-sm border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            Firebase Not Configured
          </CardTitle>
          <CardDescription className="text-destructive/80">
            Your Firebase environment variables are missing. Please follow the steps below to set them up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <p>
            To use authentication and save your analysis history, you need to connect the app to a Firebase project.
          </p>
          <div className="p-4 bg-background/50 rounded-md text-sm">
            <p className="font-semibold">1. Create a `.env` file</p>
            <p className="text-muted-foreground mb-2">If it doesn't already exist, create a file named <code>.env</code> in the root of your project.</p>

            <p className="font-semibold">2. Add your Firebase config</p>
            <p className="text-muted-foreground mb-2">
              Copy the following variables into your <code>.env</code> file and replace the placeholder values with your actual Firebase project credentials. You can find these in your <a href="https://console.firebase.google.com/" className="underline" target="_blank" rel="noopener noreferrer">Firebase project settings</a> under "General" &gt; "Your apps" &gt; "Web app".
            </p>
            <pre className="p-3 bg-black/30 rounded-md text-xs overflow-x-auto text-foreground">
              <code>
                {`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key\n`}
                {`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain\n`}
                {`NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id\n`}
                {`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket\n`}
                {`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id\n`}
                {`NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`}
              </code>
            </pre>
          </div>
          <div className="p-4 bg-background/50 rounded-md text-sm">
            <p className="font-semibold">3. Restart your app</p>
            <p className="text-muted-foreground">After saving the <code>.env</code> file, you must restart the development server for the changes to take effect.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, isLoading };

  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
  }

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className='text-muted-foreground mt-4'>Authenticating...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

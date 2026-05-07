import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  user: string | null;      // username
  role: string | null;      // "super_admin" or "operator"
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      const savedRole = localStorage.getItem('role');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);

        if (savedRole) {
          setRole(savedRole);
        } else {
          // Fetch role from server if not stored
          try {
            const res = await fetch('https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/profile/', {
              headers: { Authorization: `Bearer ${savedToken}` },
            });
            if (res.ok) {
              const profile = await res.json();
              const fetchedRole = profile.role;
              setRole(fetchedRole);
              localStorage.setItem('role', fetchedRole);
            } else {
              // Token invalid – clear storage
              localStorage.removeItem('access_token');
              localStorage.removeItem('user');
              localStorage.removeItem('role');
              setToken(null);
              setUser(null);
              setRole(null);
            }
          } catch (err) {
            // Network error, leave as is
            console.error('Failed to restore role', err);
          }
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch('https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid credentials');
    }

    const data = await response.json();
    const accessToken = data.access;

    // Store token and username
    setToken(accessToken);
    setUser(username);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', username);

    // Fetch role from profile endpoint
    try {
      const profileRes = await fetch('https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/profile/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setRole(profile.role);
        localStorage.setItem('role', profile.role);
      } else {
        setRole(null);
        localStorage.removeItem('role');
      }
    } catch (err) {
      console.error('Failed to fetch role', err);
      setRole(null);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ token, user, role, login, logout, isLoading }}>
      {children}
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
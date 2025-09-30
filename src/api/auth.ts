// Authentication service using Supabase Auth
import { supabase } from './supabase';
import { User } from '../types/act';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  name: string,
  grade: number
): Promise<AuthResponse> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          grade
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'User creation failed' };
    }

    // Create user record in our users table
    const user: User = {
      id: authData.user.id,
      name,
      email,
      grade,
      registeredAt: new Date().toISOString()
    };

    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        name: user.name,
        email: user.email,
        grade: user.grade,
        registered_at: user.registeredAt
      });

    if (dbError) {
      console.error('Database user creation error:', dbError);
      // Don't fail if user record already exists
      if (!dbError.message.includes('duplicate')) {
        return { success: false, error: 'Failed to create user profile' };
      }
    }

    return { success: true, user };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { success: false, error: error.message || 'Signup failed' };
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Auth signin error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Login failed' };
    }

    // Fetch user profile from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (dbError || !userData) {
      console.error('Database user fetch error:', dbError);
      return { success: false, error: 'Failed to load user profile' };
    }

    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      grade: userData.grade,
      registeredAt: userData.registered_at
    };

    return { success: true, user };
  } catch (error: any) {
    console.error('Signin error:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Signout error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    console.error('Signout error:', error);
    return { success: false, error: error.message || 'Logout failed' };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Always use production URL for password reset redirects
    const redirectUrl = 'https://act-prep-web.vercel.app/reset-password';
      
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message || 'Password reset failed' };
  }
};

/**
 * Update password (for password reset flow)
 */
export const updatePassword = async (
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Password update error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Password update error:', error);
    return { success: false, error: error.message || 'Password update failed' };
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session fetch error:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Session fetch error:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return session !== null;
};

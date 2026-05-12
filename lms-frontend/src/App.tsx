import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import DashboardPage from '@/pages/DashboardPage';
import CatalogPage from '@/pages/CatalogPage';
import OnboardingPage from '@/pages/OnboardingPage';

const queryClient = new QueryClient();

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const { fetchMe, token } = useAuthStore();

    useEffect(() => {
        if (token) fetchMe();
    }, []);

    return <>{children}</>;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <BrowserRouter>
                    <AuthInitializer>
                        <Routes>
                            {/* Public routes */}
                            <Route element={<PublicLayout />}>
                                <Route path="/" element={<Landing />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                            </Route>

                            {/* Protected routes with Dashboard Layout */}
                            <Route
                                element={
                                    <ProtectedRoute>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/catalog" element={<CatalogPage />} />
                                <Route path="/onboarding" element={<OnboardingPage />} />
                            </Route>
                        </Routes>
                    </AuthInitializer>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
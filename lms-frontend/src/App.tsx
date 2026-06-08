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
import CoursePage from '@/pages/CoursePage';
import LectureCreatePage from '@/pages/LectureCreatePage';
import LectureEditPage from '@/pages/LectureEditPage';
import TeacherCoursesPage from '@/pages/TeacherCoursesPage';
import TeacherCourseEditPage from '@/pages/TeacherCourseEditPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import TeacherGroupsPage from '@/pages/TeacherGroupsPage';
import MyGroupPage from '@/pages/MyGroupPage';
import UserProfilePage from "@/pages/UserProfilePage.tsx";
import AssignmentsPage from '@/pages/AssignmentsPage';
import CodePlaygroundPage from '@/pages/CodePlaygroundPage';
import PracticeSubmitPage from '@/pages/PracticeSubmitPage';
import GradesPage from '@/pages/GradesPage';
import { Toaster } from '@/components/ui/sonner';
import MyCoursesPage from '@/pages/MyCoursesPage';

const queryClient = new QueryClient();

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const { fetchMe } = useAuthStore();

    useEffect(() => {
        fetchMe();
    }, []);

    return <>{children}</>;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <Toaster position="bottom-right" richColors />
                <BrowserRouter>
                    <AuthInitializer>
                        <Routes>
                            {/* Public routes */}
                            <Route element={<PublicLayout />}>
                                <Route path="/" element={<Landing />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                            </Route>

                            <Route
                                path="/course/:courseId/practice/:lectureId"
                                element={
                                    <ProtectedRoute>
                                        <PracticeSubmitPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Course page — свой лейаут */}
                            <Route
                                path="/course/:courseId"
                                element={
                                    <ProtectedRoute>
                                        <CoursePage />
                                    </ProtectedRoute>
                                }
                            />

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
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/lectures/create" element={<LectureCreatePage />} />
                                <Route path="/my-courses" element={<MyCoursesPage />} />
                                <Route path="/lectures/edit/:lectureId" element={<LectureEditPage />} />
                                <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
                                <Route path="/teacher/courses/:courseId" element={<TeacherCourseEditPage />} />
                                <Route path="/teacher/groups" element={<TeacherGroupsPage />} />
                                <Route path="/my-group" element={<MyGroupPage />} />
                                <Route path="/user/:userId" element={<UserProfilePage />} />
                                <Route path="/assignments" element={<AssignmentsPage />} />
                                <Route path="/playground" element={<CodePlaygroundPage />} />
                                <Route path="/grades" element={<GradesPage />} />
                            </Route>
                        </Routes>
                    </AuthInitializer>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import {
    LayoutDashboard,
    BookOpen,
    Compass,
    Settings,
    LogOut,
    Sun,
    Moon,
    Menu,
    ChevronLeft,
    Users,
    ClipboardList,
    Code,
    Star
} from 'lucide-react';

import Logo from "@/pages/Logo.tsx";
import AchievementToast from '@/components/AchievementToast';


const studentNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/my-courses', icon: LayoutDashboard, label: 'Мои курсы' },

    { to: '/catalog', icon: Compass, label: 'Каталог курсов' },
    { to: '/playground', icon: Code, label: 'Code Playground' },
    { to: '/assignments', icon: ClipboardList, label: 'Задания' },
    { to: '/grades', icon: Star, label: 'Успеваемость' },
    { to: '/my-group', icon: Users, label: 'Моя группа' },
    { to: '/settings', icon: Settings, label: 'Настройки' },
];

const teacherNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/teacher/courses', icon: BookOpen, label: 'Управление курсами' },
    { to: '/assignments', icon: ClipboardList, label: 'Задания' },
    { to: '/teacher/groups', icon: Users, label: 'Группы' },
    { to: '/catalog', icon: Compass, label: 'Каталог' },
    { to: '/playground', icon: Code, label: 'Code Playground' },
    { to: '/settings', icon: Settings, label: 'Настройки' },
];

export default function DashboardLayout() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'U';

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-6 border-b">
                <Logo iconOnly={collapsed} />
            </Link>

            <nav className="flex-1 py-4 space-y-1 px-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span className="text-sm">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={() => setCollapsed(!collapsed)}
                className="mx-2 mb-2 p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
                <ChevronLeft
                    className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
                />
            </button>
        </div>
    );


    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <aside
                className={`hidden lg:flex flex-col border-r bg-card transition-all duration-300 ${
                    collapsed ? 'w-[72px]' : 'w-[240px]'
                }`}
            >
                <SidebarContent />
            </aside>

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <Sheet>
                                <SheetTrigger asChild className="lg:hidden">
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-5 w-5"/>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[240px] p-0">
                                    <SheetClose asChild>
                                        <div>
                                            <SidebarContent/>
                                        </div>
                                    </SheetClose>
                                </SheetContent>
                            </Sheet>

                            <h1 className="text-lg font-semibold hidden sm:block">
                                {navItems.find((i) => i.to === location.pathname)?.label || 'Prisma'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                {theme === 'light' ? (
                                    <Moon className="h-5 w-5"/>
                                ) : (
                                    <Sun className="h-5 w-5"/>
                                )}
                            </Button>

                            <Link to="/profile" className="flex items-center gap-2 pl-2 border-l hover:opacity-80 transition-opacity">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : undefined} />
                                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium">{user?.fullName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                                </div>
                            </Link>

                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <Outlet/>
                    <AchievementToast />
                </main>
            </div>
        </div>
    );
}
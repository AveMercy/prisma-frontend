import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon, GraduationCap } from 'lucide-react';

export default function PublicLayout() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                        <GraduationCap className="h-8 w-8" />
                        <span>CodeLearn</span>
                    </Link>

                    {/* Navigation + Actions */}
                    <nav className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/login')}>
                            Войти
                        </Button>
                        <Button onClick={() => navigate('/register')}>
                            Регистрация
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Page Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/50">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                    © 2026 CodeLearn. Все права защищены.
                </div>
            </footer>
        </div>
    );
}
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const { user, logout } = useAuthStore();

    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold">Добро пожаловать, {user?.fullName}!</h1>
            <p className="mt-2 text-muted-foreground">Роль: {user?.role}</p>
            <Button className="mt-6" variant="outline" onClick={logout}>
                Выйти
            </Button>
        </div>
    );
}
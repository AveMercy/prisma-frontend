import { motion } from 'framer-motion';

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
}

export default function Logo({ className = '', iconOnly = false }: LogoProps) {
    return (
        <div
            className={`flex items-center select-none transition-all duration-300 ${
                iconOnly ? 'w-full justify-center' : 'gap-2.5'
            } ${className}`}
        >
            <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                {/* Мягкое внутреннее свечение для темной темы */}
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full dark:opacity-100 opacity-0 transition-opacity" />

                <motion.svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-primary relative z-10"
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    <path
                        d="M12 2C12 7.5 12 10 20 12C14.5 12 12 14.5 12 20C12 14.5 9.5 12 4 12C9.5 12 12 9.5 12 2Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        strokeLinejoin="round"
                    />
                </motion.svg>
            </div>

                {!iconOnly && (
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent whitespace-nowrap">
                Prisma
                </span>
                )}
        </div>
    );
}
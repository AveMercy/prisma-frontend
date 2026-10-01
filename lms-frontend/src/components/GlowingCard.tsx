import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import React from 'react';

interface GlowingCardProps {
    children: React.ReactNode;
    className?: string;
}

export function GlowingCard({ children, className = "" }: GlowingCardProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            className={`group relative rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-sm transition-colors duration-300 hover:bg-zinc-900/40 ${className}`}
        >
            <motion.div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none -z-10"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            250px circle at ${mouseX}px ${mouseY}px,
                            rgba(59, 130, 246, 0.25),
                            transparent 80%
                        )
                    `,
                }}
            />

            <motion.div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none -z-10"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            400px circle at ${mouseX}px ${mouseY}px,
                            rgba(6, 182, 212, 0.07),
                            transparent 65%
                        )
                    `,
                }}
            />

            <div className="relative z-10 h-full flex flex-col justify-between">
                {children}
            </div>
        </div>
    );
}
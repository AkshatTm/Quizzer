"use client";

import { ReactNode } from "react";

interface BentoGridProps {
    children: ReactNode;
    className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
    return (
        <div
            className={`grid gap-4 h-[calc(100vh-8rem)] ${className}`}
            style={{
                gridTemplateColumns: "1fr 2fr",
                gridTemplateRows: "1fr 200px",
            }}
        >
            {children}
        </div>
    );
}

interface BentoTileProps {
    children: ReactNode;
    className?: string;
    span?: "col" | "row" | "both";
}

export function BentoTile({ children, className = "", span }: BentoTileProps) {
    const spanClasses = {
        col: "col-span-2",
        row: "row-span-2",
        both: "col-span-2 row-span-2",
    };

    return (
        <div className={`${span ? spanClasses[span] : ""} ${className}`}>
            {children}
        </div>
    );
}

// Mobile-friendly stack view
export function MobileStack({ children, className = "" }: BentoGridProps) {
    return (
        <div className={`flex flex-col gap-4 min-h-screen ${className}`}>
            {children}
        </div>
    );
}

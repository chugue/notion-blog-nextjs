'use client';

import { useActiveHeading } from '@/presentation/hooks/blog/use-active-heading';
import { useTocList } from '@/presentation/hooks/blog/use-toc-list';
import { cn } from '@/shared/utils/tailwind-cn';
import { motion } from 'framer-motion';
import { TableOfContentsLink } from './TableOfContentsLink';

export interface TocItem {
    id: string;
    value: string;
    depth: number;
    children: TocItem[];
}

interface TableOfContentsWrapperProps {
    isMobile?: boolean;
    className?: string;
}

const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

const TableOfContentsWrapper = ({ isMobile, className }: TableOfContentsWrapperProps) => {
    const { toc } = useTocList();
    const activeHeading = useActiveHeading();

    if (isMobile) {
        return (
            <aside className={cn('size-full justify-center', className)}>
                <div className="self-center">
                    <nav className="space-y-3 overflow-hidden">
                        {toc.length > 0 &&
                            toc.map((item: TocItem) => (
                                <TableOfContentsLink
                                    key={item.id}
                                    item={item}
                                    activeHeading={activeHeading}
                                    className="justify-center"
                                />
                            ))}
                    </nav>
                </div>
            </aside>
        );
    }

    if (toc.length === 0) return null;

    return (
        <aside className="ml-10 hidden size-full justify-self-start md:block">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="sticky top-[var(--sticky-top)] mt-[var(--sticky-toc-offset)] self-start border-l-2 border-black/50 dark:border-white/50"
            >
                <nav className="space-y-3 overflow-hidden">
                    <h2 className="mb-2 pl-4 text-xl font-bold">목차</h2>
                    {toc.map((item: TocItem) => (
                        <motion.div key={item.id} variants={itemVariants}>
                            <TableOfContentsLink
                                item={item}
                                activeHeading={activeHeading}
                            />
                        </motion.div>
                    ))}
                </nav>
            </motion.div>
        </aside>
    );
};

export default TableOfContentsWrapper;

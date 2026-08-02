import Link from 'next/link';
import MarkupScript from '@/components/shared-components/markup-script/markup-script';
import { SITE_INFO } from '@/app/constants';

export type BreadcrumbItem = { label: string; href: string };

const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": `${SITE_INFO.domain}${item.href}`,
        })),
    };

    return (
        <>
            <MarkupScript jsonLd={jsonLd} />
            <nav className="breadcrumbs" aria-label="Хлебные крошки">
                {items.map((item, index) =>
                    index === items.length - 1 ? (
                        <span key={index} className="breadcrumb-item">{item.label}</span>
                    ) : (
                        <Link key={index} href={item.href} className="breadcrumb-item">{item.label}</Link>
                    )
                )}
            </nav>
        </>
    );
};

export default Breadcrumbs;

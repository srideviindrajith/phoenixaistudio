'use client';

import { TemplateManagementSystem } from '@/components/admin/template-management-system';

export default function PortfolioTemplatesPage() {
    return (
        <TemplateManagementSystem 
            category="portfolio"
            title="Portfolio Templates Catalog"
            description="Configure and publish internal portfolio layouts."
        />
    );
}

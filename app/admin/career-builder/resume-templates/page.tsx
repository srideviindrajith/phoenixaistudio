'use client';

import { TemplateManagementSystem } from '@/components/admin/template-management-system';

export default function ResumeTemplatesPage() {
    return (
        <TemplateManagementSystem 
            category="resume"
            title="Resume Templates Catalog"
            description="Configure and publish internal resume layouts."
        />
    );
}

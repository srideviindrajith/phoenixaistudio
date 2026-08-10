'use client';

import { TemplateManagementSystem } from '@/components/admin/template-management-system';
import { ModuleToggle } from '@/components/admin/module-toggle';

export default function CoverLetterTemplatesPage() {
    return (
        <div className="min-h-screen bg-[#050507] text-white">
            {/* Module Toggle */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <ModuleToggle moduleKey="cover-letter-templates" moduleName="Cover Letter Templates" />
            </div>
            <TemplateManagementSystem 
                category="cover-letter"
                title="Cover Letter Templates Catalog"
                description="Configure and publish internal cover letter layouts."
            />
        </div>
    );
}

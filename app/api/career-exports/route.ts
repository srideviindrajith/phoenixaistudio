import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'prisma', 'career_exports.json');

const INITIAL_EXPORTS = [
    {
        id: 'EXP-7281',
        date: '2026-07-12',
        type: 'Tailored Resume Document',
        format: 'PDF',
        status: 'Exported',
        fileSize: '360 KB',
        settings: 'Compression: Medium, Quality: High'
    },
    {
        id: 'EXP-6192',
        date: '2026-07-11',
        type: 'Interactive Portfolio System',
        format: 'JSON',
        status: 'Downloaded',
        fileSize: '2.4 KB',
        settings: 'Pretty Print: True, Schema: 2.0'
    },
    {
        id: 'EXP-5102',
        date: '2026-07-10',
        type: 'LinkedIn Bio Optimization',
        format: 'TXT',
        status: 'Exported',
        fileSize: '4.8 KB',
        settings: 'Encoding: UTF-8, Line Ending: LF'
    }
];

function readExportsFromFile() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
            fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_EXPORTS, null, 2), 'utf-8');
            return INITIAL_EXPORTS;
        }
        const raw = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error reading exports file:', e);
        return INITIAL_EXPORTS;
    }
}

function writeExportsToFile(exports: any[]) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(exports, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error writing exports file:', e);
    }
}

export async function GET() {
    const exports = readExportsFromFile();
    return NextResponse.json({ success: true, exports });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const exports = readExportsFromFile();
        
        const newExport = {
            id: body.id || `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
            date: body.date || new Date().toISOString().split('T')[0],
            type: body.type || 'Tailored Resume Document',
            format: body.format || 'PDF',
            status: body.status || 'Exported',
            fileSize: body.fileSize || '120 KB',
            settings: body.settings || 'Default Settings'
        };

        exports.unshift(newExport);
        writeExportsToFile(exports);
        
        return NextResponse.json({ success: true, export: newExport });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, error: 'Export ID is required' }, { status: 400 });
        }
        
        const exports = readExportsFromFile();
        const filtered = exports.filter((e: any) => e.id !== id);
        writeExportsToFile(filtered);
        
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

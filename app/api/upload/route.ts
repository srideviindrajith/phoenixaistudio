import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const isZip = file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
    const isHtml = file.name.endsWith('.html') || file.type === 'text/html';
    const isCss = file.name.endsWith('.css') || file.type === 'text/css';
    const isJson = file.name.endsWith('.json') || file.type === 'application/json';
    const isImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);

    if (!isZip && !isHtml && !isCss && !isJson && !isImage) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (10MB max for templates, 5MB for images)
    const maxSize = (isZip || isHtml) ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large (max ${maxSize / (1024*1024)}MB)` }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // For HTML files, validate they are simple templates (not React/Next.js apps)
    if (isHtml) {
      const htmlContent = buffer.toString('utf-8');
      // Reject files that are React/Next.js app entry points
      if (htmlContent.includes('Loading routes') || 
          htmlContent.includes('_next/static') ||
          htmlContent.includes('react-dom') ||
          htmlContent.includes('@vite') ||
          htmlContent.includes('/main.tsx') ||
          htmlContent.includes('/main.jsx')) {
        return NextResponse.json({ error: 'Uploaded HTML is a React/Next.js app entry point. Please upload a simple HTML template without JavaScript dependencies.' }, { status: 400 })
      }
    }

    // Create unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch {
      // Directory already exists
    }

    // Write file
    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    let url = `/uploads/${filename}`

    // Handle ZIP archive extraction to make its internal entry layout previewable
    if (isZip) {
      const folderName = filename.replace('.zip', '')
      const destDir = path.join(uploadsDir, folderName)
      try {
        const { execSync } = require('child_process')
        // Unzip using native Windows PowerShell command Expand-Archive
        execSync(`powershell -Command "Expand-Archive -Path '${filepath}' -DestinationPath '${destDir}' -Force"`)

        // Search for index.html, template.html, or resume.html
        const fs = require('fs')
        function findHtmlFile(dir: string): string | null {
          const files = fs.readdirSync(dir)
          for (const f of files) {
            const fullPath = path.join(dir, f)
            const stat = fs.statSync(fullPath)
            if (stat.isDirectory()) {
              const res: string | null = findHtmlFile(fullPath)
              if (res) return res
            } else if (f.toLowerCase() === 'index.html' || f.toLowerCase() === 'template.html' || f.toLowerCase() === 'resume.html') {
              return path.relative(uploadsDir, fullPath)
            }
          }
          return null
        }

        const relPath = findHtmlFile(destDir)
        if (relPath) {
          // Validate the HTML file is a simple template (not React/Next.js app)
          const htmlFilePath = path.join(uploadsDir, relPath)
          const fs = require('fs')
          const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8')
          if (htmlContent.includes('Loading routes') || 
              htmlContent.includes('_next/static') ||
              htmlContent.includes('react-dom') ||
              htmlContent.includes('@vite') ||
              htmlContent.includes('/main.tsx') ||
              htmlContent.includes('/main.jsx')) {
            return NextResponse.json({ error: 'ZIP contains a React/Next.js app entry point. Please upload a simple HTML template without JavaScript dependencies.' }, { status: 400 })
          }
          url = `/uploads/${relPath.replace(/\\/g, '/')}`
        } else {
          // No HTML entry found – reject the upload
          return NextResponse.json({ error: 'No HTML entry file found in uploaded ZIP' }, { status: 400 })
        }
      } catch (err) {
        console.error('Failed to unzip archive in upload handler:', err)
      }
    }

    return NextResponse.json({ url, filename })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

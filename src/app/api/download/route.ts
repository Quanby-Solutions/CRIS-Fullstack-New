// src\app\api\download\route.ts
import path from 'path'

import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get('path')

    if (!filePath) {
        return new NextResponse(null, { status: 400 })
    }

    const cleanPath = filePath.replace(/^\/+/, '').replace(/\.\./g, '')
    const fullPath = path.join(process.cwd(), 'public', cleanPath)
    const fileBuffer = await readFile(fullPath)

    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
            'Cache-Control': 'no-store'
        },
    })
}
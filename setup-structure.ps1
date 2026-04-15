# Create Directories
Write-Host "Creating directory structure..."

# App Router & API
New-Item -ItemType Directory -Force -Path "app/api/auth", "app/api/jobs", "app/api/portfolio" | Out-Null
New-Item -ItemType Directory -Force -Path "app/(seeker)/profile", "app/(seeker)/jobs" | Out-Null
New-Item -ItemType Directory -Force -Path "app/(employer)/post-job", "app/(employer)/dashboard" | Out-Null

# Components
New-Item -ItemType Directory -Force -Path "components/telegram", "components/ui", "components/Shared" | Out-Null

# Hooks, Lib, Styles
New-Item -ItemType Directory -Force -Path "hooks", "lib", "public", "styles" | Out-Null

# Create Placeholder Files
Write-Host "Creating files..."

# API Routes
New-Item -ItemType File -Force -Path "app/api/auth/route.ts" | Out-Null
New-Item -ItemType File -Force -Path "app/api/jobs/route.ts" | Out-Null
New-Item -ItemType File -Force -Path "app/api/portfolio/route.ts" | Out-Null

# Pages
New-Item -ItemType File -Force -Path "app/(seeker)/profile/page.tsx" | Out-Null
New-Item -ItemType File -Force -Path "app/(seeker)/jobs/page.tsx" | Out-Null
New-Item -ItemType File -Force -Path "app/(employer)/post-job/page.tsx" | Out-Null
New-Item -ItemType File -Force -Path "app/(employer)/dashboard/page.tsx" | Out-Null

# Components
New-Item -ItemType File -Force -Path "components/telegram/MainButton.tsx" | Out-Null
New-Item -ItemType File -Force -Path "components/telegram/BackButton.tsx" | Out-Null

# Hooks & Lib
New-Item -ItemType File -Force -Path "hooks/useTelegram.ts" | Out-Null
New-Item -ItemType File -Force -Path "hooks/useAuth.ts" | Out-Null
New-Item -ItemType File -Force -Path "lib/telegram.ts" | Out-Null
New-Item -ItemType File -Force -Path "lib/supabase.ts" | Out-Null

# Env
$envPath = ".env.local"
if (-not (Test-Path $envPath)) {
    "TELEGRAM_BOT_TOKEN=8716751336:AAEx3RHE5V_IBxgEcYjZdTQ6bf9PHozAe1s_" | Out-File -FilePath $envPath -Encoding utf8
    Write-Host ".env.local created (Note: Remember to revoke/update your token!)"
}

Write-Host "All done! Your project structure is ready."
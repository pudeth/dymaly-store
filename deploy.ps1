# PowerShell Deployment Helper Script for Bong Store System
# This script helps prepare your project for deployment

Write-Host "🚀 Bong Store System - Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
}

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
if (Test-CommandExists node) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm installation
if (Test-CommandExists npm) {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Select deployment option:" -ForegroundColor Cyan
Write-Host "1. Test locally"
Write-Host "2. Prepare for Git deployment (Render/Railway/Heroku)"
Write-Host "3. Docker deployment"
Write-Host "4. Check deployment readiness"
Write-Host "5. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting local test server..." -ForegroundColor Yellow
        Write-Host ""
        
        # Install dependencies
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Dependencies installed" -ForegroundColor Green
            Write-Host ""
            Write-Host "Starting server..." -ForegroundColor Yellow
            Write-Host "Access your site at: http://localhost:3000" -ForegroundColor Green
            Write-Host "Admin panel at: http://localhost:3000/admin.html" -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
            Write-Host ""
            npm start
        } else {
            Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Preparing for Git deployment..." -ForegroundColor Yellow
        Write-Host ""
        
        # Check if git is installed
        if (Test-CommandExists git) {
            Write-Host "✓ Git installed" -ForegroundColor Green
            
            # Initialize git if not already
            if (-not (Test-Path ".git")) {
                Write-Host "Initializing Git repository..." -ForegroundColor Yellow
                git init
                Write-Host "✓ Git repository initialized" -ForegroundColor Green
            } else {
                Write-Host "✓ Git repository exists" -ForegroundColor Green
            }
            
            # Create .env.example if not exists
            if (-not (Test-Path ".env.example")) {
                Write-Host "Creating .env.example..." -ForegroundColor Yellow
                # File already created above
            }
            
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Create a repository on GitHub/GitLab" -ForegroundColor White
            Write-Host "2. Run these commands:" -ForegroundColor White
            Write-Host "   git add ." -ForegroundColor Gray
            Write-Host "   git commit -m 'Initial commit for deployment'" -ForegroundColor Gray
            Write-Host "   git branch -M main" -ForegroundColor Gray
            Write-Host "   git remote add origin <your-repo-url>" -ForegroundColor Gray
            Write-Host "   git push -u origin main" -ForegroundColor Gray
            Write-Host ""
            Write-Host "3. Deploy to your chosen platform:" -ForegroundColor White
            Write-Host "   - Render: https://render.com" -ForegroundColor Gray
            Write-Host "   - Railway: https://railway.app" -ForegroundColor Gray
            Write-Host "   - Heroku: https://heroku.com" -ForegroundColor Gray
            Write-Host ""
            Write-Host "See QUICK_DEPLOY.md for detailed instructions" -ForegroundColor Yellow
            
        } else {
            Write-Host "✗ Git not found. Install from https://git-scm.com" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Docker deployment..." -ForegroundColor Yellow
        Write-Host ""
        
        if (Test-CommandExists docker) {
            Write-Host "✓ Docker installed" -ForegroundColor Green
            Write-Host ""
            Write-Host "Starting Docker deployment..." -ForegroundColor Yellow
            
            # Check if docker-compose exists
            if (Test-CommandExists docker-compose) {
                docker-compose up -d
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host ""
                    Write-Host "✓ Deployment successful!" -ForegroundColor Green
                    Write-Host "Access your site at: http://localhost:3000" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Management commands:" -ForegroundColor Cyan
                    Write-Host "  View logs: docker-compose logs -f" -ForegroundColor Gray
                    Write-Host "  Stop: docker-compose down" -ForegroundColor Gray
                    Write-Host "  Restart: docker-compose restart" -ForegroundColor Gray
                } else {
                    Write-Host "✗ Deployment failed" -ForegroundColor Red
                }
            } else {
                Write-Host "✗ docker-compose not found" -ForegroundColor Red
                Write-Host "Install Docker Desktop from https://docker.com" -ForegroundColor Yellow
            }
        } else {
            Write-Host "✗ Docker not found" -ForegroundColor Red
            Write-Host "Install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "Checking deployment readiness..." -ForegroundColor Yellow
        Write-Host ""
        
        $issues = @()
        
        # Check package.json
        if (Test-Path "package.json") {
            Write-Host "✓ package.json exists" -ForegroundColor Green
        } else {
            Write-Host "✗ package.json missing" -ForegroundColor Red
            $issues += "package.json missing"
        }
        
        # Check server.js
        if (Test-Path "server.js") {
            Write-Host "✓ server.js exists" -ForegroundColor Green
        } else {
            Write-Host "✗ server.js missing" -ForegroundColor Red
            $issues += "server.js missing"
        }
        
        # Check public directory
        if (Test-Path "public") {
            Write-Host "✓ public directory exists" -ForegroundColor Green
        } else {
            Write-Host "✗ public directory missing" -ForegroundColor Red
            $issues += "public directory missing"
        }
        
        # Check uploads directory
        if (Test-Path "public\uploads") {
            Write-Host "✓ uploads directory exists" -ForegroundColor Green
        } else {
            Write-Host "⚠ uploads directory missing (will be created automatically)" -ForegroundColor Yellow
        }
        
        # Check database
        if (Test-Path "phonestore.db") {
            Write-Host "✓ Database exists" -ForegroundColor Green
        } else {
            Write-Host "⚠ Database missing (will be created on first run)" -ForegroundColor Yellow
        }
        
        # Check node_modules
        if (Test-Path "node_modules") {
            Write-Host "✓ Dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "⚠ Dependencies not installed (run: npm install)" -ForegroundColor Yellow
            $issues += "Dependencies not installed"
        }
        
        Write-Host ""
        
        if ($issues.Count -eq 0) {
            Write-Host "✓ Project is ready for deployment!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Review QUICK_DEPLOY.md for deployment options" -ForegroundColor White
            Write-Host "2. Choose your deployment platform" -ForegroundColor White
            Write-Host "3. Follow the platform-specific guide" -ForegroundColor White
        } else {
            Write-Host "✗ Issues found:" -ForegroundColor Red
            foreach ($issue in $issues) {
                Write-Host "  - $issue" -ForegroundColor Red
            }
            Write-Host ""
            Write-Host "Please fix these issues before deploying" -ForegroundColor Yellow
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "For more information, see:" -ForegroundColor Cyan
Write-Host "- QUICK_DEPLOY.md - Quick deployment guide" -ForegroundColor White
Write-Host "- DEPLOYMENT_GUIDE.md - Complete deployment documentation" -ForegroundColor White
Write-Host "- DEPLOYMENT_CHECKLIST.md - Deployment checklist" -ForegroundColor White
Write-Host ""

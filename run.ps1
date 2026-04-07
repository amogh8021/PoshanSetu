# PoshanSetu Startup Script
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/CPAnti2"

Write-Host "🚀 Starting PoshanSetu Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\2026\mimit\cp Anti@\poshansetu-backend'; .\maven\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run"

Write-Host "🌐 Starting PoshanSetu Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\2026\mimit\cp Anti@\poshansetu-frontend'; npm run dev"

Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:5173"

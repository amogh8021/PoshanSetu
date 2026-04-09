# PoshanSetu Startup Script
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/CPAnti2"

Write-Host "🧠 Starting PoshanSetu ML Service..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\2026\mimit\cp Anti@\poshansetu-ml'; ..\.venv\Scripts\python.exe app.py"

Write-Host "🚀 Starting PoshanSetu Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\2026\mimit\cp Anti@\poshansetu-backend'; .\maven\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run"

Write-Host "🌐 Starting PoshanSetu Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\2026\mimit\cp Anti@\poshansetu-frontend'; npm run dev"

Write-Host "✅ All services are starting in separate windows!" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:8080"
Write-Host "ML:       http://localhost:5000"

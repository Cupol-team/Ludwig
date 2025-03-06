@echo off
setlocal enabledelayedexpansion

echo [SETUP] Starting development environment setup...

:: Переход в корневую директорию проекта
cd ..\..

:: Проверка наличия необходимых инструментов
echo [SETUP] Checking required tools...

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python not found. Please install Python.
    exit /b 1
)

:: Проверка Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js.
    exit /b 1
)

:: Проверка npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm not found. Please install npm.
    exit /b 1
)

echo [SUCCESS] All required tools found.

:: Настройка Python окружения для API
echo [SETUP] Setting up Python environment for API...

cd API

if not exist requirements.txt (
    echo [WARNING] requirements.txt file not found in API directory.
    echo [SETUP] Creating empty virtual environment...
)

if exist .venv (
    echo [WARNING] Virtual environment already exists. Skipping creation.
) else (
    echo [SETUP] Creating virtual environment...
    python -m venv .venv
    
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        cd ..
        exit /b 1
    )
)

echo [SETUP] Activating virtual environment and installing dependencies...

call .venv\Scripts\activate.bat

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to activate virtual environment.
    cd ..
    exit /b 1
)

:: Проверяем pip внутри виртуального окружения
python -m pip --version >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] pip not available in virtual environment.
    call deactivate
    cd ..
    exit /b 1
)

if exist requirements.txt (
    echo [SETUP] Installing Python dependencies...
    python -m pip install -r requirements.txt
    
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install Python dependencies.
        call deactivate
        cd ..
        exit /b 1
    )
)

call deactivate
cd ..
echo [SUCCESS] Python environment for API set up successfully.

:: Настройка Node.js окружения для WEB
echo [SETUP] Setting up Node.js environment for WEB...

cd WEB

if not exist package.json (
    echo [ERROR] package.json file not found in WEB directory.
    cd ..
    exit /b 1
)

echo [SETUP] Installing Node.js dependencies for WEB...
call npm install

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Node.js dependencies for WEB.
    cd ..
    exit /b 1
)

cd ..
echo [SUCCESS] Node.js environment for WEB set up successfully.

:: Настройка Node.js окружения для signaling
echo [SETUP] Setting up Node.js environment for signaling...

cd signaling

if not exist package.json (
    echo [ERROR] package.json file not found in signaling directory.
    cd ..
    exit /b 1
)

echo [SETUP] Installing Node.js dependencies for signaling...
call npm install

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Node.js dependencies for signaling.
    cd ..
    exit /b 1
)

cd ..
echo [SUCCESS] Node.js environment for signaling set up successfully.

:: Создание .env файла для API из примера, если он не существует
echo [SETUP] Checking for .env files...

if exist API\.env.example (
    if not exist API\.env (
        echo [SETUP] Creating .env file for API from example...
        copy API\.env.example API\.env
        echo [SUCCESS] .env file created. Please edit it with your settings.
    )
)

echo [SUCCESS] Development environment setup completed successfully!
echo [SETUP] You can run the project using docker-compose up or run components separately.

endlocal 
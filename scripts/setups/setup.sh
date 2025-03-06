#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений с префиксом
log() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Переход в корневую директорию проекта
cd ../..

# Проверка наличия необходимых инструментов
check_requirements() {
    log "Checking required tools..."
    
    # Проверка Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 not found. Please install Python 3."
        exit 1
    fi
    
    # Проверка Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js."
        exit 1
    fi
    
    # Проверка npm
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Please install npm."
        exit 1
    fi
    
    log_success "All required tools found."
}

# Настройка Python окружения для API
setup_python_env() {
    log "Setting up Python environment for API..."
    
    cd API
    
    # Проверка наличия requirements.txt
    if [ ! -f "requirements.txt" ]; then
        log_warning "requirements.txt file not found in API directory."
        log "Creating empty virtual environment..."
    fi
    
    # Создание виртуального окружения
    if [ -d ".venv" ]; then
        log_warning "Virtual environment already exists. Skipping creation."
    else
        log "Creating virtual environment..."
        python3 -m venv .venv
        
        if [ $? -ne 0 ]; then
            log_error "Failed to create virtual environment."
            cd ..
            return 1
        fi
    fi
    
    # Активация виртуального окружения и установка зависимостей
    log "Activating virtual environment and installing dependencies..."
    
    # Определение команды активации в зависимости от ОС
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        source .venv/Scripts/activate
    else
        # Linux/macOS
        source .venv/bin/activate
    fi
    
    if [ $? -ne 0 ]; then
        log_error "Failed to activate virtual environment."
        cd ..
        return 1
    fi
    
    # Проверка pip внутри виртуального окружения
    python -m pip --version &> /dev/null
    if [ $? -ne 0 ]; then
        log_error "pip not available in virtual environment."
        deactivate
        cd ..
        return 1
    fi
    
    # Установка зависимостей, если requirements.txt существует
    if [ -f "requirements.txt" ]; then
        log "Installing Python dependencies..."
        python -m pip install -r requirements.txt
        
        if [ $? -ne 0 ]; then
            log_error "Failed to install Python dependencies."
            deactivate
            cd ..
            return 1
        fi
    fi
    
    deactivate
    cd ..
    log_success "Python environment for API set up successfully."
}

# Настройка Node.js окружения для WEB
setup_web_env() {
    log "Setting up Node.js environment for WEB..."
    
    cd WEB
    
    # Проверка наличия package.json
    if [ ! -f "package.json" ]; then
        log_error "package.json file not found in WEB directory."
        cd ..
        return 1
    fi
    
    # Установка зависимостей
    log "Installing Node.js dependencies for WEB..."
    npm install
    
    if [ $? -ne 0 ]; then
        log_error "Failed to install Node.js dependencies for WEB."
        cd ..
        return 1
    fi
    
    cd ..
    log_success "Node.js environment for WEB set up successfully."
}

# Настройка Node.js окружения для signaling
setup_signaling_env() {
    log "Setting up Node.js environment for signaling..."
    
    cd signaling
    
    # Проверка наличия package.json
    if [ ! -f "package.json" ]; then
        log_error "package.json file not found in signaling directory."
        cd ..
        return 1
    fi
    
    # Установка зависимостей
    log "Installing Node.js dependencies for signaling..."
    npm install
    
    if [ $? -ne 0 ]; then
        log_error "Failed to install Node.js dependencies for signaling."
        cd ..
        return 1
    fi
    
    cd ..
    log_success "Node.js environment for signaling set up successfully."
}

# Создание .env файла для API из примера, если он не существует
setup_env_files() {
    log "Checking for .env files..."
    
    if [ -f "API/.env.example" ] && [ ! -f "API/.env" ]; then
        log "Creating .env file for API from example..."
        cp API/.env.example API/.env
        log_success ".env file created. Please edit it with your settings."
    fi
}

# Основная функция
main() {
    log "Starting development environment setup..."
    
    check_requirements
    setup_python_env
    setup_web_env
    setup_signaling_env
    setup_env_files
    
    log_success "Development environment setup completed successfully!"
    log "You can run the project using docker-compose up or run components separately."
}

# Запуск основной функции
main 
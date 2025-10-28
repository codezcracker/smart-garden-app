#!/bin/bash
# Smart Garden IoT - Production Deployment Script

set -e

echo "🚀 Smart Garden IoT - Production Deployment"
echo "=========================================="

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    echo "✅ Requirements check passed"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm ci --production
    echo "✅ Dependencies installed"
}

# Build application
build_application() {
    echo "🔨 Building application..."
    npm run build
    echo "✅ Application built successfully"
}

# Run tests
run_tests() {
    echo "🧪 Running tests..."
    npm test
    echo "✅ Tests passed"
}

# Deploy to Vercel
deploy_vercel() {
    echo "🚀 Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    vercel --prod
    echo "✅ Deployed to Vercel successfully"
}

# Deploy with Docker
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed"
        exit 1
    fi
    
    docker build -t smart-garden-iot .
    docker run -d -p 3000:3000 --name smart-garden-iot smart-garden-iot
    echo "✅ Deployed with Docker successfully"
}

# Deploy with Docker Compose
deploy_compose() {
    echo "🐳 Deploying with Docker Compose..."
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed"
        exit 1
    fi
    
    docker-compose up -d
    echo "✅ Deployed with Docker Compose successfully"
}

# Main deployment function
main() {
    local deployment_type=$1
    
    case $deployment_type in
        "vercel")
            check_requirements
            install_dependencies
            build_application
            run_tests
            deploy_vercel
            ;;
        "docker")
            check_requirements
            install_dependencies
            build_application
            run_tests
            deploy_docker
            ;;
        "compose")
            deploy_compose
            ;;
        *)
            echo "Usage: $0 {vercel|docker|compose}"
            echo ""
            echo "Deployment options:"
            echo "  vercel   - Deploy to Vercel (recommended)"
            echo "  docker   - Deploy with Docker"
            echo "  compose  - Deploy with Docker Compose (full stack)"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📱 Your Smart Garden IoT app is now live!"
}

# Run main function
main "$@"

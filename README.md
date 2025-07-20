# 🌱 Smart Garden IoT System

A comprehensive IoT-based smart garden management system with a massive plant database of over 1.6 million species.

## 🚀 Features

- **🌿 Plant Database**: Access to 1.6M+ plant species with detailed information
- **🔍 Advanced Search**: Search by name, family, or category with real-time filtering
- **📊 Smart Pagination**: Efficient browsing with 24 plants per page
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🌙 Dark/Light Theme**: Toggle between themes for better user experience
- **⚡ Fast Performance**: Optimized for large datasets with intelligent caching
- **🎯 IoT Integration Ready**: Prepared for sensor data and automation features

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, CSS3
- **Backend**: Node.js API routes
- **Data**: CSV-based plant database
- **Deployment**: Vercel-ready
- **Package Manager**: Yarn

## 📁 Project Structure

```
smart-garden-app/
├── data/                          # Data files
│   ├── plant-database-sample.csv # Sample plant database (1,000 species)
│   └── plant-database.csv        # Full plant database (1.6M+ species) - add your file here
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── api/                  # API routes
│   │   │   └── plants-converted/ # Plant data API
│   │   ├── plants/               # Plants page
│   │   ├── sensors/              # IoT sensors page
│   │   ├── automation/           # Automation page
│   │   └── analytics/            # Analytics page
│   └── components/               # React components
├── public/                       # Static assets
└── package.json                  # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/smart-garden-app.git
   cd smart-garden-app
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Add your plant database:**
   - The repository includes a sample CSV file with 1,000 plants
   - For the full 1.6M+ plant database:
     - Place your full CSV file in the `data/` folder
     - Rename it to `plant-database.csv`
     - Update the API route to use `plant-database.csv` instead of `plant-database-sample.csv`
   - Ensure it has the required columns: name, family, category, etc.

4. **Run the development server:**
   ```bash
   yarn dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Data Format

Your CSV file should have the following structure:

```csv
name,family,category,genus,species
"Plant Name","Family Name","Category","Genus","Species"
```

### Required Columns:
- `name`: Plant common name
- `family`: Plant family
- `category`: Plant category (Species, Genus, Family, etc.)
- `genus`: Plant genus
- `species`: Plant species

## 🌐 Deployment

### Vercel Deployment

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

2. **Environment Variables:**
   - No additional environment variables needed
   - CSV data is included in the repository

3. **Deploy:**
   - Vercel will automatically deploy on every push to main branch
   - Your app will be available at: `https://your-app-name.vercel.app`

### Manual Deployment

```bash
# Build the project
yarn build

# Start production server
yarn start
```

## 🔧 Configuration

### API Endpoints

- `GET /api/plants-converted` - Get plant data with pagination and filtering
  - Query parameters:
    - `page`: Page number (default: 1)
    - `limit`: Plants per page (default: 24)
    - `search`: Search term
    - `family`: Filter by family
    - `category`: Filter by category

### Pagination

- **Page Size**: 24 plants per page (6 rows × 4 columns)
- **Navigation**: Previous/Next buttons with page numbers
- **Mobile**: Responsive pagination controls

### Performance

- **Caching**: 5-minute cache for API responses
- **Optimization**: Server-side pagination for large datasets
- **Loading**: Smart loading states and debounced search

## 🎨 Customization

### Themes

The app supports light and dark themes. Customize colors in `src/app/globals.css`:

```css
:root {
  --primary-color: #10b981;
  --background-card: #ffffff;
  --text-primary: #1f2937;
  /* ... more variables */
}

[data-theme="dark"] {
  --background-card: #1f2937;
  --text-primary: #f9fafb;
  /* ... dark theme variables */
}
```

### Styling

- **CSS Variables**: Easy theme customization
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions and hover effects

## 📱 Features

### Plant Database
- Browse 1.6M+ plant species
- Search by name, family, or category
- Filter by plant family and category
- View detailed plant information
- Toggle between card and list views

### IoT Integration Ready
- Sensor data display
- Automation controls
- Analytics dashboard
- Real-time monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/smart-garden-app/issues) page
2. Create a new issue with detailed information
3. Include your CSV file format and any error messages

## 🔮 Roadmap

- [ ] IoT sensor integration
- [ ] Real-time data visualization
- [ ] Plant care automation
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Community features

---

**Built with ❤️ for smart gardening enthusiasts**

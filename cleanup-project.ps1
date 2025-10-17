# EmotionAid Project Cleanup Script
# This script removes unused/old files from the project
# Created: October 17, 2025

Write-Host "🧹 EmotionAid Project Cleanup Starting..." -ForegroundColor Cyan
Write-Host ""

# Files to delete
$filesToDelete = @(
    # Root directory - Unused documentation
    "all-files.txt",
    "example-integration.tsx",
    "implementation-guide.md",
    "MULTIMODAL_FUSION_GUIDE.md",
    "WEIGHTED_FUSION_ANALYSIS.md",
    
    # Unused component files
    "src\app\Components\AnimatedBackground.tsx",
    "src\app\Components\AnimatedCard.tsx",
    "src\app\Components\animations.css",
    "src\app\Components\BreathingOverlay.tsx",
    "src\app\Components\emotion-animations.css",
    "src\app\Components\Emotion.tsx",
    "src\app\Components\EmotionAids.tsx",
    "src\app\Components\EmotionCombined.tsx",
    "src\app\Components\EmotionDisplay.tsx",
    "src\app\Components\EmotionRadarChart.tsx",
    "src\app\Components\EnhancedEmotionDisplay.tsx",
    "src\app\Components\FinalEmotion.tsx",
    "src\app\Components\LoadingIndicator.tsx",
    "src\app\Components\MicroInteractions.tsx",
    "src\app\Components\PulsingCameraButton.tsx",
    "src\app\Components\RadialEmotionChart.tsx",
    "src\app\Components\UnifiedEmotionAid.tsx",
    "src\app\Components\AnotherEmotion.tsx"
)

# Count files
$totalFiles = $filesToDelete.Count
$deletedCount = 0
$notFoundCount = 0

Write-Host "📋 Files to be deleted: $totalFiles" -ForegroundColor Yellow
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Do you want to proceed with deletion? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Cleanup cancelled by user." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🗑️  Deleting files..." -ForegroundColor Green
Write-Host ""

foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host "❌ Failed to delete: $file" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  Not found: $file" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎉 Cleanup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Deleted: $deletedCount files" -ForegroundColor Green
Write-Host "⚠️  Not found: $notFoundCount files" -ForegroundColor Yellow
Write-Host "📁 Total processed: $totalFiles files" -ForegroundColor Cyan
Write-Host ""

# Calculate space saved (approximate)
Write-Host "💾 Estimated space saved: ~5-10 MB" -ForegroundColor Magenta
Write-Host ""

# Show remaining important files
Write-Host "📌 Important files kept:" -ForegroundColor Cyan
Write-Host "   ✅ src/app/Components/modifying.tsx (MAIN COMPONENT)" -ForegroundColor Green
Write-Host "   ✅ src/app/Components/InitialRedirect.tsx" -ForegroundColor Green
Write-Host "   ✅ src/app/Components/Auth.tsx" -ForegroundColor Green
Write-Host "   ✅ flask-backend/ (all backend files)" -ForegroundColor Green
Write-Host "   ✅ package.json, tsconfig.json (configs)" -ForegroundColor Green
Write-Host "   ✅ README.md" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Your project is now cleaner and ready to share!" -ForegroundColor Green
Write-Host ""

# Optional: Update page.tsx to remove unused import
Write-Host "📝 Would you like to clean up unused imports in page.tsx? (yes/no)" -ForegroundColor Yellow
$cleanImports = Read-Host

if ($cleanImports -eq "yes") {
    Write-Host "✅ Please manually remove unused imports from src/app/page.tsx" -ForegroundColor Green
    Write-Host "   Remove: import EmotionRecognitionAppThird from './Components/AnotherEmotion';" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All done! Happy coding!" -ForegroundColor Magenta

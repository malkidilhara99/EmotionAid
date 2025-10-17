@echo off
echo ========================================
echo EmotionAid Project Cleanup
echo ========================================
echo.

echo This will delete 22 unused files from your project.
echo.
set /p confirm="Continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cleanup cancelled.
    pause
    exit
)

echo.
echo Deleting files...
echo.

REM Root directory files
if exist "all-files.txt" del "all-files.txt" && echo Deleted: all-files.txt
if exist "example-integration.tsx" del "example-integration.tsx" && echo Deleted: example-integration.tsx  
if exist "implementation-guide.md" del "implementation-guide.md" && echo Deleted: implementation-guide.md
if exist "MULTIMODAL_FUSION_GUIDE.md" del "MULTIMODAL_FUSION_GUIDE.md" && echo Deleted: MULTIMODAL_FUSION_GUIDE.md
if exist "WEIGHTED_FUSION_ANALYSIS.md" del "WEIGHTED_FUSION_ANALYSIS.md" && echo Deleted: WEIGHTED_FUSION_ANALYSIS.md

REM Component files
if exist "src\app\Components\AnimatedBackground.tsx" del "src\app\Components\AnimatedBackground.tsx" && echo Deleted: AnimatedBackground.tsx
if exist "src\app\Components\AnimatedCard.tsx" del "src\app\Components\AnimatedCard.tsx" && echo Deleted: AnimatedCard.tsx
if exist "src\app\Components\animations.css" del "src\app\Components\animations.css" && echo Deleted: animations.css
if exist "src\app\Components\BreathingOverlay.tsx" del "src\app\Components\BreathingOverlay.tsx" && echo Deleted: BreathingOverlay.tsx
if exist "src\app\Components\emotion-animations.css" del "src\app\Components\emotion-animations.css" && echo Deleted: emotion-animations.css
if exist "src\app\Components\Emotion.tsx" del "src\app\Components\Emotion.tsx" && echo Deleted: Emotion.tsx
if exist "src\app\Components\EmotionAids.tsx" del "src\app\Components\EmotionAids.tsx" && echo Deleted: EmotionAids.tsx
if exist "src\app\Components\EmotionCombined.tsx" del "src\app\Components\EmotionCombined.tsx" && echo Deleted: EmotionCombined.tsx
if exist "src\app\Components\EmotionDisplay.tsx" del "src\app\Components\EmotionDisplay.tsx" && echo Deleted: EmotionDisplay.tsx
if exist "src\app\Components\EmotionRadarChart.tsx" del "src\app\Components\EmotionRadarChart.tsx" && echo Deleted: EmotionRadarChart.tsx
if exist "src\app\Components\EnhancedEmotionDisplay.tsx" del "src\app\Components\EnhancedEmotionDisplay.tsx" && echo Deleted: EnhancedEmotionDisplay.tsx
if exist "src\app\Components\FinalEmotion.tsx" del "src\app\Components\FinalEmotion.tsx" && echo Deleted: FinalEmotion.tsx
if exist "src\app\Components\LoadingIndicator.tsx" del "src\app\Components\LoadingIndicator.tsx" && echo Deleted: LoadingIndicator.tsx
if exist "src\app\Components\MicroInteractions.tsx" del "src\app\Components\MicroInteractions.tsx" && echo Deleted: MicroInteractions.tsx
if exist "src\app\Components\PulsingCameraButton.tsx" del "src\app\Components\PulsingCameraButton.tsx" && echo Deleted: PulsingCameraButton.tsx
if exist "src\app\Components\RadialEmotionChart.tsx" del "src\app\Components\RadialEmotionChart.tsx" && echo Deleted: RadialEmotionChart.tsx
if exist "src\app\Components\UnifiedEmotionAid.tsx" del "src\app\Components\UnifiedEmotionAid.tsx" && echo Deleted: UnifiedEmotionAid.tsx
if exist "src\app\Components\AnotherEmotion.tsx" del "src\app\Components\AnotherEmotion.tsx" && echo Deleted: AnotherEmotion.tsx

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Your project is now cleaner.
echo Important files kept:
echo   - modifying.tsx (MAIN COMPONENT)
echo   - InitialRedirect.tsx
echo   - Auth.tsx
echo   - All backend files
echo.
pause

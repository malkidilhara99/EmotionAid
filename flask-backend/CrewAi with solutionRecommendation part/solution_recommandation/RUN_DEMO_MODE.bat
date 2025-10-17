@echo off
echo ================================================
echo   EMOTIONAID - DEMO MODE (NO API REQUIRED)
echo ================================================
echo.
echo This mode generates realistic outputs WITHOUT
echo calling any external APIs - perfect for demos!
echo.
echo ================================================
echo.

set FORCE_LOCAL_CREW=1

echo Testing with SAD emotion...
echo.
python src\solution_recommandation\main.py run Sad "feeling lonely"
echo.
echo ================================================
echo.
echo Testing with HAPPY emotion...
echo.
python src\solution_recommandation\main.py run Happy "got promotion"
echo.
echo ================================================
echo.
echo Demo complete! Check the outputs above.
echo.
pause

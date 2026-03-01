document.addEventListener('DOMContentLoaded', () => {
    // Smooth Scroll for Nav
    const predictCta = document.querySelector('.predict-cta');
    predictCta.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#form-section').scrollIntoView({ behavior: 'smooth' });
    });

    // Theme Logic (Global)
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const themeIcon = themeToggle ? themeToggle.querySelector('.icon') : null;

    if (themeToggle) {
        // Check saved preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            root.setAttribute('data-theme', 'dark');
            if (themeIcon) themeIcon.innerText = '☀️'; // Switch to sun icon for dark mode
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                root.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                if (themeIcon) themeIcon.innerText = '🌙';
            } else {
                root.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) themeIcon.innerText = '☀️';
            }
        });
    }

    // Form Logic (Only on Prediction Page)
    const form = document.getElementById('predictionForm');
    if (form) {
        const resultSection = document.getElementById('resultSection');
        const loadingDiv = document.getElementById('loading');
        const resultContent = document.getElementById('resultContent');
        const resultBadge = document.getElementById('resultBadge');
        const resultText = document.getElementById('resultText');
        const confidenceBox = document.getElementById('confidenceBox');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show loading, hide form/results
            resultSection.classList.remove('hidden');
            loadingDiv.classList.remove('hidden');
            resultContent.classList.add('hidden');

            // Scroll to result
            resultSection.scrollIntoView({ behavior: 'smooth' });

            // Gather Data
            const formData = {
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                height: document.getElementById('height').value,
                weight: document.getElementById('weight').value,
                ap_hi: document.getElementById('ap_hi').value,
                ap_lo: document.getElementById('ap_lo').value,
                cholesterol: document.getElementById('cholesterol').value,
                gluc: document.getElementById('gluc').value,
                smoke: document.getElementById('smoke').checked ? 1 : 0,
                alco: document.getElementById('alco').checked ? 1 : 0,
                active: document.getElementById('active').checked ? 1 : 0
            };

            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                // Artificial delay for better UX (so spinner doesn't flicker too fast)
                await new Promise(r => setTimeout(r, 600));

                loadingDiv.classList.add('hidden');
                resultContent.classList.remove('hidden');

                if (data.error) {
                    resultText.innerText = "Error: " + data.error;
                    return;
                }

                // Display Results
                // Prediction 0 = Low Risk (Cardio=0), 1 = High Risk (Cardio=1)
                if (data.prediction === 1) {
                    // High Risk
                    resultBadge.innerText = "High Risk Detected 🔴";
                    resultBadge.className = "result-badge high-risk";
                    resultText.innerText = "The model suggests an elevated likelihood of cardiovascular concern. Please consult a healthcare professional.";
                } else {
                    // Low Risk
                    resultBadge.innerText = "Low Risk 🟢";
                    resultBadge.className = "result-badge low-risk";
                    resultText.innerText = "The model suggests a low risk at this time. Maintain healthy habits!";
                }

                // Show confidence if available
                confidenceBox.innerText = data.confidence ? `Model Confidence: ${data.confidence}%` : "";

            } catch (error) {
                loadingDiv.classList.add('hidden');
                resultContent.classList.remove('hidden');
                resultText.innerText = "Connection failed. Please check server.";
            }
        });
    }
});

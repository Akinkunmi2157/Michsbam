document.addEventListener('DOMContentLoaded', () => {

    // 1. Before/After Image Slider Logic
    const slider = document.getElementById('before-after-slider');
    const foregroundImg = document.querySelector('.foreground-img');
    const sliderButton = document.querySelector('.slider-button');

    if (slider) {
        slider.addEventListener('input', (e) => {
            const sliderValue = e.target.value;
            // Update the width of the top image overlay
            foregroundImg.style.width = `${ sliderValue }%`;
            // Move the line accent divider accordingly
            sliderButton.style.left = `${ sliderValue }%`;
        });
    }

    // 2. Project Cost Calculator Logic
    const serviceType = document.getElementById('service-type');
    const projectSize = document.getElementById('project-size');
    const hoursVal = document.getElementById('hours-val');
    const mobileService = document.getElementById('mobile-service');
    const totalPriceDisplay = document.getElementById('total-price');

    function calculateCost() {
        const hourlyRate = parseFloat(serviceType.value);
        const hours = parseInt(projectSize.value);
        const isMobile = mobileService.checked ? parseFloat(mobileService.value) : 0;

        // Update real-time label for the range slider
        hoursVal.textContent = hours;

        // Formula: (Rate * Hours) + Flat mobile fee setup
        const total = (hourlyRate * hours) + isMobile;

        // Display nicely formatted price
        totalPriceDisplay.textContent = `$${ total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }`;
    }

    // Event listeners to update price seamlessly as user interacts
    if (serviceType && projectSize && mobileService) {
        serviceType.addEventListener('change', calculateCost);
        projectSize.addEventListener('input', calculateCost);
        mobileService.addEventListener('change', calculateCost);

        // Run initial calculation on page load
        calculateCost();
    }

    // 3. Optional: Form Submission Toast notification simulation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Thank you! Your quote request has been sent. A structural specialist will get back to you shortly.");
            contactForm.reset();
        });
    }
});
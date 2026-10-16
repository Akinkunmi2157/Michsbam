// ==========================================
// 1. SUPABASE CLOUD INITIALIZATION
// ==========================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Replace these placeholders with your actual keys from your Supabase Dashboard project settings
const supabaseUrl = 'https://doycxxeyallwqreqqgdz.supabase.co'
const supabaseKey = 'sb_publishable_n-WzJzx1e3kq4Etr-jjNWg_dkq_5sPh'
const supabase = createClient(supabaseUrl, supabaseKey)

// --- CLOUD STORAGE HANDLERS ---
async function saveCalculationToCloud(calculationPayload) {
    try {
        const { data, error } = await supabase
            .from('solar_calculations') // Your cloud table name
            .insert([calculationPayload]);

        if (error) {
            console.error("Cloud Storage Error:", error.message);
        } else {
            console.log("Calculation safely synced to your cloud database!");
        }
    } catch (err) {
        console.error("Failed to connect to storage server:", err);
    }
}

// Global function to fetch your total historical calculations back whenever you build an admin view
export async function getCalculationHistory() {
    try {
        const { data, error } = await supabase
            .from('solar_calculations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error retrieving historical records:", err);
        return [];
    }
}


// ==========================================
// 2. LOADER SYSTEM
// ==========================================
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }, 1000);
    }
});


// ==========================================
// 3. DOM CONTENT LOADED - MAIN INTERACTIONS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // --- GALLERY FILTER ---
    const filterButtons = document.querySelectorAll(".filter-btn");
    const galleryItems = document.querySelectorAll(".gallery-item");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const activeBtn = document.querySelector(".filter-btn.active");
            if (activeBtn) activeBtn.classList.remove("active");
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute("data-category");
                if (filterValue === "all" || filterValue === itemCategory) {
                    item.classList.remove("hide");
                } else {
                    item.classList.add("hide");
                }
            });
        });
    });

    // --- SOLAR LOAD CALCULATOR ---
    const calculateBtn = document.getElementById("calculate-btn");
    const resultBox = document.getElementById("calc-result");
    const kwValueDisplay = document.getElementById("kw-value");
    const recommendationDisplay = document.getElementById("recommendation");
    const invoiceItemsTable = document.getElementById("invoice-items");
    const subtotalDisplay = document.getElementById("subtotal-val");
    const workmanshipDisplay = document.getElementById("workmanship-val");
    const grandTotalDisplay = document.getElementById("grand-total-val");

    const powerProfiles = {
        house: { tv: 120, fan: 75, lights: 15, freezer: 300, laptop: 65 },
        shop: { tv: 150, fan: 100, lights: 30, freezer: 450, laptop: 90 },
        organization: { tv: 200, fan: 120, lights: 40, freezer: 600, laptop: 100 }
    };

    if (calculateBtn) {
        calculateBtn.addEventListener("click", () => {
            const buildingType = document.getElementById("building-type").value;
            if (buildingType === "") {
                if (recommendationDisplay) {
                    recommendationDisplay.textContent = "Please select a valid building type before calculating.";
                }
                if (resultBox) resultBox.classList.remove("hidden");
                return;
            }

            const tvCount = parseInt(document.getElementById("tv").value) || 0;
            const fanCount = parseInt(document.getElementById("fan").value) || 0;
            const lightsCount = parseInt(document.getElementById("lights").value) || 0;
            const freezerCount = parseInt(document.getElementById("freezer").value) || 0;
            const laptopCount = parseInt(document.getElementById("laptop").value) || 0;

            const profile = powerProfiles[buildingType];

            const totalWatts = (tvCount * profile.tv) +
                (fanCount * profile.fan) +
                (lightsCount * profile.lights) +
                (freezerCount * profile.freezer) +
                (laptopCount * profile.laptop);

            const totalKilowatts = totalWatts / 1000;
            if (kwValueDisplay) kwValueDisplay.textContent = totalKilowatts.toFixed(2);

            let itemsPackage = [];
            let workmanshipFee = 0;

            if (totalWatts === 0) {
                if (recommendationDisplay) recommendationDisplay.textContent = "Please add items to calculate your solar package requirements.";
                if (invoiceItemsTable) invoiceItemsTable.innerHTML = '<tr><td colspan="4" style="text-align:center;">No appliances selected</td></tr>';
                if (subtotalDisplay) subtotalDisplay.textContent = "₦0";
                if (workmanshipDisplay) workmanshipDisplay.textContent = "₦0";
                if (grandTotalDisplay) grandTotalDisplay.textContent = "₦0";
                if (resultBox) resultBox.classList.remove("hidden");
                return;
            }

            if (totalKilowatts <= 1.2) {
                workmanshipFee = 60000;
                itemsPackage = [
                    { name: "550W Monocrystalline Solar Panel", qty: 2, price: 135000 },
                    { name: "1KVA / 12V Hybrid Smart Solar Inverter", qty: 1, price: 150000 },
                    { name: "12V / 100Ah Deep Cycle Lithium Battery", qty: 1, price: 260000 },
                    { name: "Solar Cable, Rail Racks & Protection Breaker Box Pack", qty: 1, price: 75000 }
                ];
                if (recommendationDisplay) recommendationDisplay.textContent = "Perfect for a residential layout. We recommend a 1KVA system layout optimized for clean continuous home distribution.";
            } else if (totalKilowatts <= 3.5) {
                workmanshipFee = 120000;
                itemsPackage = [
                    { name: "550W Monocrystalline Solar Panel", qty: 4, price: 135000 },
                    { name: "3.5KVA / 24V Hybrid MPPT Solar Inverter", qty: 1, price: 380000 },
                    { name: "24V / 200Ah High-Capacity Lithium Battery Pack", qty: 1, price: 930000 },
                    { name: "Complete Heavy-Duty Installation Kit & Surge Protection Box", qty: 1, price: 130000 }
                ];
                if (recommendationDisplay) recommendationDisplay.textContent = "Standard Commercial/Residential Hybrid setup. Ideal for managing active workloads comfortably.";
            } else {
                workmanshipFee = 250000;
                itemsPackage = [
                    { name: "550W Monocrystalline Solar Panel", qty: 8, price: 135000 },
                    { name: "5KVA / 48V Premium Pure Sine Wave Hybrid Inverter", qty: 1, price: 650000 },
                    { name: "48V / 200Ah Industrial Grade Lithium Storage Cell (10kWh)", qty: 1, price: 1850000 },
                    { name: "Industrial Distribution Array Materials & Balancing Kits", qty: 1, price: 220000 }
                ];
                if (recommendationDisplay) recommendationDisplay.textContent = "Industrial framework calculated. Engineered to securely support commercial operations.";
            }

            let materialSubtotal = 0;
            let htmlRows = "";

            itemsPackage.forEach(item => {
                const rowTotal = item.qty * item.price;
                materialSubtotal += rowTotal;
                htmlRows += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.qty}</td>
                        <td>₦${item.price.toLocaleString()}</td>
                        <td>₦${rowTotal.toLocaleString()}</td>
                    </tr>
                `;
            });

            const grandTotal = materialSubtotal + workmanshipFee;

            if (invoiceItemsTable) invoiceItemsTable.innerHTML = htmlRows;
            if (subtotalDisplay) subtotalDisplay.textContent = `₦${materialSubtotal.toLocaleString()}`;
            if (workmanshipDisplay) workmanshipDisplay.textContent = `₦${workmanshipFee.toLocaleString()}`;
            if (grandTotalDisplay) grandTotalDisplay.textContent = `₦${grandTotal.toLocaleString()}`;

            // --- DYNAMIC ROI SAVINGS CALCULATIONS ---
            const paybackTermDisplay = document.getElementById("roi-payback-term");
            const savingsTenDisplay = document.getElementById("roi-savings-ten");

            if (paybackTermDisplay && savingsTenDisplay) {
                if (totalKilowatts <= 1.2) {
                    paybackTermDisplay.textContent = "2.8 Years";
                    savingsTenDisplay.textContent = `₦${(grandTotal * 3.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                } else if (totalKilowatts <= 3.5) {
                    paybackTermDisplay.textContent = "3.4 Years";
                    savingsTenDisplay.textContent = `₦${(grandTotal * 4.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                } else {
                    paybackTermDisplay.textContent = "4.1 Years";
                    savingsTenDisplay.textContent = `₦${(grandTotal * 5.0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                }
            }

            // --- AUTOMATED DATA STORAGE IN CLOUD SYNC ---
            const cloudPayload = {
                building_type: buildingType,
                total_watts: totalWatts,
                total_kw: parseFloat(totalKilowatts.toFixed(2)),
                material_subtotal: materialSubtotal,
                workmanship_fee: workmanshipFee,
                grand_total: grandTotal,
                tv_count: tvCount,
                fan_count: fanCount,
                lights_count: lightsCount,
                freezer_count: freezerCount,
                laptop_count: laptopCount,
                created_at: new Date().toISOString()
            };
            saveCalculationToCloud(cloudPayload);

            // --- HIGH-CAPACITY USER CONVERSION ROUTER ---
            const contactHeadline = document.querySelector("#contact h2");
            const submitFormButton = document.querySelector("#contact-form button[type='submit']");

            if (totalKilowatts > 3.5) {
                if (submitFormButton) {
                    submitFormButton.innerHTML = `<i class="fas fa-calendar-check"></i> Book Technical Engineering Site Audit`;
                    submitFormButton.style.backgroundColor = "#fb8500";
                }
                if (contactHeadline) {
                    contactHeadline.textContent = "Schedule Your Industrial Site Deployment Consultation";
                }
            } else {
                if (submitFormButton) {
                    submitFormButton.innerHTML = `Send Message`;
                    submitFormButton.style.backgroundColor = "";
                }
                if (contactHeadline) {
                    contactHeadline.textContent = "Get In Touch";
                }
            }

            if (resultBox) resultBox.classList.remove("hidden");
        });
    }

    // ==========================================
    // 4. INVOICE DOWNLOADS (PDF & IMAGE)
    // ==========================================
    const pdfBtn = document.getElementById("download-pdf-btn");
    const imgBtn = document.getElementById("download-img-btn");
    const invoiceContainer = document.getElementById("calc-result");

    if (pdfBtn) {
        pdfBtn.addEventListener("click", () => {
            if (!invoiceContainer) {
                console.error("Invoice container wrapper '#calc-result' not found!");
                return;
            }

            const invoiceId = "MBS-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
            const currentDate = new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });

            const standardHeader = document.createElement("div");
            standardHeader.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #023047; padding-bottom: 15px; margin-bottom: 20px; font-family: sans-serif;">
                    <div>
                        <h2 style="color: #023047; margin: 0; font-size: 24px;">MICH'SBAM SOLAR SOLUTIONS</h2>
                        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 13px;">Clean Energy Frameworks & Installations</p>
                    </div>
                    <div style="text-align: right; font-size: 13px; color: #334155;">
                        <p style="margin: 0;"><strong>Invoice Ref:</strong> ${invoiceId}</p>
                        <p style="margin: 3px 0 0 0;"><strong>Date Issued:</strong> ${currentDate}</p>
                    </div>
                </div>
            `;

            const standardFooter = document.createElement("div");
            standardFooter.innerHTML = `
                <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-left: 4px solid #fb8500; border-radius: 4px; font-size: 12px; color: #475569; font-family: sans-serif; text-align: left;">
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #023047;">Important Notice:</p>
                    <p style="margin: 0;">This breakdown represents an automated load estimation. Component market prices fluctuate weekly. This quotation is valid for exactly 14 days from issuance. To lock in this pricing matrix or schedule an engineering deployment site audit, please contact our administrative desk or click the WhatsApp gateway on our platform.</p>
                </div>
            `;

            const downloadActionsGroup = invoiceContainer.querySelector(".download-actions");
            if (downloadActionsGroup) downloadActionsGroup.style.display = "none";

            invoiceContainer.prepend(standardHeader);
            invoiceContainer.appendChild(standardFooter);

            const options = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `Michsbam_Solar_Invoice_${invoiceId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(options).from(invoiceContainer).save().then(() => {
                standardHeader.remove();
                standardFooter.remove();
                if (downloadActionsGroup) downloadActionsGroup.style.display = "flex";
            }).catch(err => {
                console.error("PDF generation issue:", err);
                standardHeader.remove();
                standardFooter.remove();
                if (downloadActionsGroup) downloadActionsGroup.style.display = "flex";
            });
        });
    }

    if (imgBtn) {
        imgBtn.addEventListener("click", () => {
            if (!invoiceContainer) return;

            const downloadActionsGroup = invoiceContainer.querySelector(".download-actions");
            if (downloadActionsGroup) downloadActionsGroup.style.display = "none";

            html2canvas(invoiceContainer, { scale: 2, useCORS: true }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'Michsbam_Solar_Invoice.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                if (downloadActionsGroup) downloadActionsGroup.style.display = "flex";
            }).catch(err => {
                console.error("Image generation failed:", err);
                if (downloadActionsGroup) downloadActionsGroup.style.display = "flex";
            });
        });
    }
});


// ==========================================
// 5. THEME TOGGLE
// ==========================================
const themeToggle = document.querySelector(".theme-toggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const icon = themeToggle.querySelector("i");
        if (icon) {
            if (document.body.classList.contains("dark-mode")) {
                icon.classList.remove("fa-moon");
                icon.classList.add("fa-sun");
            } else {
                icon.classList.remove("fa-sun");
                icon.classList.add("fa-moon");
            }
        }
    });
}


// ==========================================
// 6. HAMBURGER MOBILE MENU
// ==========================================
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
        if (navLinks.style.display === "flex") {
            navLinks.style.display = "none";
        } else {
            navLinks.style.display = "flex";
            navLinks.style.flexDirection = "column";
            navLinks.style.position = "absolute";
            navLinks.style.top = "80px";
            navLinks.style.right = "20px";
            navLinks.style.background = "#023047";
            navLinks.style.padding = "20px";
            navLinks.style.borderRadius = "10px";
        }
    });
}


// ==========================================
// 7. BACK TO TOP BUTTON
// ==========================================
const topBtn = document.getElementById("topBtn");
if (topBtn) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            topBtn.style.display = "block";
        } else {
            topBtn.style.display = "none";
        }
    });
    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}


// ==========================================
// 8. FAQ ACCORDION
// ==========================================
const faqs = document.querySelectorAll(".faq");
faqs.forEach(faq => {
    const question = faq.querySelector("h3");
    const answer = faq.querySelector("p");
    if (question && answer) {
        answer.style.display = "none";
        question.style.cursor = "pointer";
        question.addEventListener("click", () => {
            answer.style.display = (answer.style.display === "block") ? "none" : "block";
        });
    }
});


// ==========================================
// 9. PRODUCT SEARCH BAR
// ==========================================
const searchBar = document.querySelector(".search-bar");
const products = document.querySelectorAll(".product-card");
if (searchBar) {
    searchBar.addEventListener("keyup", () => {
        const searchValue = searchBar.value.toLowerCase();
        products.forEach(product => {
            const text = product.textContent.toLowerCase();
            product.style.display = text.includes(searchValue) ? "block" : "none";
        });
    });
}


// ==========================================
// 10. TESTIMONIAL SLIDER
// ==========================================
const testimonials = document.querySelectorAll(".testimonial");
let currentTestimonial = 0;
if (testimonials.length > 0) {
    function showTestimonial(index) {
        testimonials.forEach(item => { item.style.display = "none"; });
        testimonials[index].style.display = "block";
    }
    showTestimonial(currentTestimonial);
    setInterval(() => {
        currentTestimonial++;
        if (currentTestimonial >= testimonials.length) {
            currentTestimonial = 0;
        }
        showTestimonial(currentTestimonial);
    }, 5000);
}


// ==========================================
// 11. NAVBAR TRANSPARENCY SCROLL EFFECT
// ==========================================
const navbar = document.querySelector(".navbar");
if (navbar) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
            navbar.style.background = "rgba(2,48,71,0.95)";
            navbar.style.boxShadow = "0 5px 20px rgba(0,0,0,.2)";
        } else {
            navbar.style.background = "rgba(2,48,71,.85)";
            navbar.style.boxShadow = "none";
        }
    });
}


// ==========================================
// 12. SCROLL LINK ACTIVE HIGHLIGHTER
// ==========================================
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }
    });
    navItems.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
});


// ==========================================
// 13. STRICT CONTACT FORM INPUT VALIDATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");

    const fullNameInput = document.getElementById("Full-name");
    const emailInput = document.getElementById("Email");
    const phoneInput = document.getElementById("Phone");

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const phoneError = document.getElementById("phone-error");

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{7,15}$/;

    function validateField(inputElement, errorElement, regexPattern) {
        if (!inputElement || !errorElement) return false;
        const inputValue = inputElement.value.trim();

        if (inputValue === "") {
            errorElement.style.display = "none";
            inputElement.style.borderColor = "#e2e8f0";
            return false;
        } else if (!regexPattern.test(inputValue)) {
            errorElement.style.display = "block";
            inputElement.style.borderColor = "#ef4444";
            return false;
        } else {
            errorElement.style.display = "none";
            inputElement.style.borderColor = "#25D366";
            return true;
        }
    }

    if (fullNameInput) {
        fullNameInput.addEventListener("input", () => validateField(fullNameInput, nameError, nameRegex));
    }
    if (emailInput) {
        emailInput.addEventListener("input", () => validateField(emailInput, emailError, emailRegex));
    }
    if (phoneInput) {
        phoneInput.addEventListener("input", () => validateField(phoneInput, phoneError, phoneRegex));
    }

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const isNameValid = validateField(fullNameInput, nameError, nameRegex);
            const isEmailValid = validateField(emailInput, emailError, emailRegex);
            const isPhoneValid = validateField(phoneInput, phoneError, phoneRegex);

            if (!isNameValid || !isEmailValid || !isPhoneValid) {
                if (!isNameValid) fullNameInput.focus();
                else if (!isEmailValid) emailInput.focus();
                else if (!isPhoneValid) phoneInput.focus();
                return;
            }

            const customerName = fullNameInput.value.trim();
            const customerEmail = emailInput.value.trim();
            const customerPhone = phoneInput.value.trim();

            const serviceDropdown = document.getElementById("Services") || document.querySelector("select");
            const rawServiceValue = serviceDropdown ? serviceDropdown.value : "";

            let serviceSelected = "a solar setup";
            if (rawServiceValue === "house") {
                serviceSelected = "a Residential Solar Installation for their home";
            } else if (rawServiceValue === "shop") {
                serviceSelected = "a Commercial Solar Setup for their shop/retail outlet";
            } else if (rawServiceValue === "organization") {
                serviceSelected = "an Industrial Solar Framework for their office/organization";
            } else if (rawServiceValue !== "") {
                serviceSelected = `a ${rawServiceValue} setup`;
            }

            const messageTextArea = document.querySelector("textarea");
            const customerCustomMessage = messageTextArea ? messageTextArea.value.trim() : "";

            const systemSize = document.getElementById("kw-value") ? document.getElementById("kw-value").textContent : null;

            let calculatorNote = "";
            if (systemSize && systemSize !== "0.00" && systemSize !== "Not Calculated") {
                calculatorNote = ` Based on their calculator inputs, their estimated power load requirement is ${systemSize} kW.`;
            }

            const websiteOwnerWhatsApp = "2348069971918";

            let messageTemplate = `New Lead: ${customerName} is looking to get ${serviceSelected}.${calculatorNote}\n\nYou can reach them directly via phone at ${customerPhone} or email at ${customerEmail}.`;

            if (customerCustomMessage !== "") {
                messageTemplate += `\n\nAdditional details provided by the client:\n"${customerCustomMessage}"`;
            }

            const encodedMessage = encodeURIComponent(messageTemplate);
            const whatsAppGatewayUrl = `https://wa.me/${websiteOwnerWhatsApp}?text=${encodedMessage}`;

            window.open(whatsAppGatewayUrl, '_blank');
        });
    }
});

console.log("Mich'sbam Solar Solutions Website Loaded Successfully");
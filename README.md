# Shifaa Clinic - Appointment Manager

A lightweight, modern, and responsive web application designed for small medical clinics and independent healthcare providers. It provides seamless front-desk scheduling, instant validation, and local persistence without requiring a complex backend setup.

---

## 🚀 Key Features

* **Dual View Modes:** Effortlessly switch between a clean **Card Grid View** for visual scheduling and a dense **Table View** for administrative reviews.
* **Smart Form Validation:** Strict input checking that ensures names contain only valid alphabetical characters (supporting both English and Arabic) while blocking numbers and past dates.
* **Conflict Detection & Prevention:** Automated background logic that flags scheduling overlaps and prompts the receptionist if a timeslot is already booked.
* **Advanced Filtering & Search:** Instantly filter appointments by service department, specific dates, or patient name keywords.
* **Client-Side Persistence:** Fully functional storage utilizing browser `localStorage`, ensuring data remains saved between sessions without needing an external database.
* **Responsive Design:** Fully optimized layout for desktops, tablets, and mobile devices.

---

## 🛠️ Setup & Installation Instructions

Running this application requires no complex build tools, package managers, or server configurations.

1. **Clone or Download:** Download the project files (`index.html`, `style.css`, and `app.js`) into a single local project folder.
2. **File Structure Check:** Ensure all files are placed in the same directory:
   ```text
   ├── index.html
   ├── style.css
   └── app.js
   ```
3. **Run Locally:** 
   * Simply double-click the `index.html` file to open it directly in any modern web browser (Chrome, Firefox, Safari, Edge).
   * *Recommended:* For the best development experience or if utilizing local assets, open the folder using a local server tool like **VS Code Live Server**.

---

## 💻 Usage

1. Launch the app and click **"Launch Manager"** to access the dashboard.
2. Fill out the patient details, select the medical service, and choose a valid future date and time.
3. Click **"Book Appointment"** to register. The system will auto-validate fields and check for schedule clashes.
4. Use the search bar or category filters at the top of the schedule list to manage existing patient queues.

document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const captchaCanvas = document.getElementById('captchaCanvas');
    const ctx = captchaCanvas.getContext('2d');
    let captchaText = '';
    const loginPage = document.getElementById('login-page'); 
    const dashboardPage = document.getElementById('dashboard-page');
    const logoutBtn = document.getElementById('logout-btn');
    const sidebar = document.getElementById('sidebar');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentWrappers = document.querySelectorAll('.content-wrapper');
    const skeletonLoader = document.getElementById('skeleton-loader');
    const clickableWidgets = document.querySelectorAll('.widget.clickable');
    const notificationModal = document.getElementById('notification-modal');
    const lmsModal = document.getElementById('lms-modal');
    const feeModal = document.getElementById('fee-modal');
    const serviceRequestForm = document.getElementById('service-request-form');
    const grievanceForm = document.getElementById('grievance-form');
    const neftFormContainer = document.getElementById('content-neft-payment');
    const syllabusModal = document.getElementById('syllabus-modal');

    let animationsTriggered = new Set();

    // Floating labels
    const inputs = document.querySelectorAll('.form-group input, .form-group select');
    inputs.forEach(input => {
        const label = document.querySelector(`label[for=${input.id}]`);
        if (label) {
            input.addEventListener('focus', () => label.style.display = 'none');
            input.addEventListener('blur', () => {
                if (input.value === '') {
                    label.style.display = 'block';
                }
            });
            if (input.value !== '') {
               label.style.display = 'none';
            }
        }
    });


    function generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        captchaText = '';
        for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        drawCaptcha();
    }

    function drawCaptcha() {
        ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(0, 0, captchaCanvas.width, captchaCanvas.height);
        
        // Add noise
        for(let i=0; i<20; i++) {
            ctx.strokeStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.3)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
            ctx.lineTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
            ctx.stroke();
        }

        // Draw text
        ctx.font = 'bold 24px Roboto';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(captchaText, captchaCanvas.width / 2, captchaCanvas.height / 2);
    }

    captchaCanvas.addEventListener('click', generateCaptcha);

    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Basic validation
        let isValid = true;
        const requiredFields = ['loginId', 'password', 'verificationCode', 'collegeBranch'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                isValid = false;
                // You can add error message display here
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields.');
            return;
        }

        const verificationCodeInput = document.getElementById('verificationCode').value;
        if (verificationCodeInput.toLowerCase() !== captchaText.toLowerCase()) {
            alert('Invalid verification code. Please try again.');
            generateCaptcha();
            return;
        }

        // Simulate successful login
        loginPage.style.display = 'none'; // Hide login form
        dashboardPage.style.display = 'block'; // Show dashboard container
        skeletonLoader.style.display = 'block'; // Show skeleton
        contentWrappers.forEach(w => w.style.display = 'none'); // Hide all content initially

        setTimeout(() => {
            skeletonLoader.style.display = 'none'; // Hide skeleton
            
            // Animate in dashboard
            sidebar.style.transform = 'translateX(0)';
            const dashboardContent = document.getElementById('content-dashboard');
            dashboardContent.style.display = 'block';
            dashboardContent.style.opacity = '1';
            dashboardContent.style.transform = 'translateY(0)';

            document.body.style.overflow = 'hidden';
            document.body.style.alignItems = 'flex-start';
            document.body.style.justifyContent = 'flex-start';

            // Trigger initial animations
            triggerAnimationsForContent('dashboard');
        }, 1000); // Skeleton display time
    });

    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        dashboardPage.style.display = 'none';
        loginPage.style.display = 'block';
        document.body.style.alignItems = 'center';
        // Reset sidebar and content for next login animation
        sidebar.style.transform = 'translateX(-100%)';
        contentWrappers.forEach(w => {
            w.style.opacity = '0'; w.style.transform = 'translateY(20px)';
        });
        document.body.style.justifyContent = 'center';
        loginForm.reset();
        // Reset floating labels
        inputs.forEach(input => {
            const label = document.querySelector(`label[for=${input.id}]`);
            if (label) label.style.display = 'block';
        });
        generateCaptcha();
    });

    // Initial generation
    generateCaptcha();
    
    // Initial animation states
    sidebar.style.transform = 'translateX(-100%)';
    contentWrappers.forEach(w => {
        w.style.opacity = '0';
        w.style.transform = 'translateY(20px)';
    });

    // Hamburger menu logic
    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // --- Dashboard Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const contentId = this.dataset.content;
            if (!contentId) return;

            // Hide all content wrappers
            contentWrappers.forEach(wrapper => {
                wrapper.style.display = 'none';
            });

            // Show the target content
            const targetContent = document.getElementById('content-' + contentId);
            targetContent.style.display = 'block';
            // Trigger fade-in animation
            setTimeout(() => { targetContent.style.opacity = '1'; targetContent.style.transform = 'translateY(0)'; }, 50);

            // Trigger animations for the newly displayed content
            if (!animationsTriggered.has(contentId)) {
                triggerAnimationsForContent(contentId);
                // Special case for NEFT form to ensure it's visible
                if (contentId === 'neft-payment') {
                    document.getElementById('neft-form-container').classList.add('active');
                }
                animationsTriggered.add(contentId);
            }
            // Update active link
            navLinks.forEach(nav => nav.classList.remove('active'));
            // Hide old content
            contentWrappers.forEach(wrapper => {
                if (wrapper.id !== 'content-' + contentId) { wrapper.style.display = 'none'; wrapper.style.opacity = '0'; wrapper.style.transform = 'translateY(20px)'; }
            });

            this.classList.add('active');
        });
    });

    // --- Animate Progress Bars on View ---
    // --- Clickable Widgets Logic ---
    clickableWidgets.forEach(widget => {
        widget.addEventListener('click', function() {
            const targetContentId = this.dataset.targetContent;
            if (!targetContentId) return;

            // Find the corresponding nav link and click it
            const targetNavLink = document.querySelector(`.sidebar-nav a[data-content="${targetContentId}"]`);
            if (targetNavLink) {
                targetNavLink.click();

                // On mobile, close the sidebar after clicking
                if (window.innerWidth <= 992 && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            }
        });
    });

    // --- Animation Triggers ---
    function triggerAnimationsForContent(contentId) {
        const contentEl = document.getElementById('content-' + contentId);
        if (!contentEl) return;

        // Animate circular progress bars for attendance
        if (contentId === 'attendance') {
            const progressCircles = contentEl.querySelectorAll('.circular-progress .fg');
            progressCircles.forEach(circle => {
                // Initial state is already 220 in CSS, transition to data value
                setTimeout(() => {
                    circle.style.strokeDashoffset = circle.dataset.dashoffset;
                }, 100);
            });
        }

        // Animate numbers (count-up effect)
        const countUpElements = contentEl.querySelectorAll('[data-count]');
        countUpElements.forEach(el => {
            const target = +el.dataset.count;
            let current = 0;
            const increment = target / 100; // Adjust for speed

            const updateCount = () => {
                if (current < target) {
                    current += increment;
                    el.textContent = Math.ceil(current).toLocaleString();
                    requestAnimationFrame(updateCount);
                } else {
                    el.textContent = target.toLocaleString();
                }
            };
            updateCount();
        });
    }

    // --- Live User Status ---
    function updateDateTime() {
        const dateTimeEl = document.getElementById('current-datetime');
        if (dateTimeEl) {
            const now = new Date();
            dateTimeEl.textContent = now.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
    }
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute

    // --- Notification Modal Logic ---

    const notificationData = {
        'exam-schedule': {
            title: 'End Term Examination Schedule',
            body: `
                <p>This is to inform all students that the End Term Examination for the Even Semester (2024) is scheduled to commence from <strong>15th May 2024</strong>.</p>
                <p>The detailed date sheet has been uploaded to the university website and can be accessed via the LMS portal. Please ensure you have cleared all pending dues to be eligible to sit for the examinations.</p>
                <p><strong>Note:</strong> Admit cards will be available for download from 10th May 2024.</p>
            `
        },
        'convocation': {
            title: 'Convocation 2024 Registration',
            body: `
                <p>The 5th Annual Convocation of K.R. Mangalam University will be held on <strong>20th June 2024</strong>. Graduating students of the 2024 batch are requested to register for the event.</p>
                <p>Registration is mandatory to attend the ceremony. The last date for registration is <strong>30th May 2024</strong>. Please visit the university portal to complete your registration.</p>
            `
        },
        'holiday': {
            title: 'Holiday Notice: Ram Navami',
            body: '<p>The university will remain closed on <strong>17th April 2024</strong> on account of Ram Navami. All academic and administrative activities will be suspended. The university will resume its normal functioning on 18th April 2024.</p>'
        },
        'fee-deadline': {
            title: 'Fee Payment Deadline Extension',
            body: '<p>The deadline for the payment of semester fees has been extended to <strong>30th April 2024</strong> without any late fee. Students are advised to pay their fees on or before the new deadline to avoid any inconvenience.</p>'
        },
        'sessional-marks': {
            title: 'Mid-Term Sessional Marks Published',
            body: '<p>The sessional marks for the Mid-Term Examinations have been published. Students can view their marks by logging into their iCloudEMS portal under the "Results & Grades" section. Any discrepancies must be reported to the examination cell within 3 working days.</p>'
        }
    };

    // --- LMS Modal Logic ---
    const lmsModalTitle = document.getElementById('lms-modal-title');
    const lmsModalBody = document.getElementById('lms-modal-body');
    const lmsModalCloseBtn = document.getElementById('lms-modal-close-btn');

    const assignmentData = {
        'dsa-trees': {
            title: 'Lab Assignment 5: Trees',
            submissionDate: '24 Apr 2024, 11:30 PM',
            grade: 'A',
            feedback: 'Excellent work. The implementation of the AVL tree was efficient and well-documented.'
        },
        'os-casestudy': {
            title: 'Case Study: Linux vs Windows',
            submissionDate: '27 Apr 2024, 8:00 PM',
            grade: 'Pending',
            feedback: 'Your submission is currently being graded.'
        }
    };

    document.querySelectorAll('.lms-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.dataset.action;
            const assignmentId = btn.dataset.assignment;
            const data = assignmentData[assignmentId];

            if (action === 'view' && data) {
                lmsModalTitle.textContent = data.title;
                lmsModalBody.innerHTML = `
                    <ul class="profile-details-list">
                        <li><span>Submission Date</span><strong>${data.submissionDate}</strong></li>
                        <li><span>Grade</span><strong>${data.grade}</strong></li>
                        <li><span>Feedback</span><p>${data.feedback}</p></li>
                    </ul>
                    <a href="#" class="btn-primary" style="margin-top: 20px; display: inline-block;"><i class="fas fa-download"></i> Download Submission</a>
                `;
                lmsModal.classList.add('show');
            } else if (action === 'submit' || action === 'submit-overdue') {
                lmsModalTitle.textContent = `Submit: ${btn.closest('tr').querySelector('td:nth-child(2)').textContent}`;
                const overdueWarning = action === 'submit-overdue' ? `<p class="text-center text-red-500 font-semibold mb-4">This submission is overdue. Late penalties may apply.</p>` : '';
                lmsModalBody.innerHTML = `
                    ${overdueWarning}
                    <div class="file-upload-wrapper" id="file-upload-area">
                        <input type="file" id="lms-file-input" />
                        <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
                        <p>Drag & drop your file here</p>
                        <small>or click to browse</small>
                    </div>
                    <div class="text-center mt-4">
                        <button id="upload-assignment-btn" class="btn-primary" disabled>Upload Assignment</button>
                    </div>
                `;
                lmsModal.classList.add('show');

                // Add event listeners for the new modal content
                const fileUploadArea = document.getElementById('file-upload-area');
                const lmsFileInput = document.getElementById('lms-file-input');
                const uploadBtn = document.getElementById('upload-assignment-btn');

                fileUploadArea.addEventListener('click', () => lmsFileInput.click());
                lmsFileInput.addEventListener('change', () => {
                    if (lmsFileInput.files.length > 0) {
                        fileUploadArea.querySelector('p').textContent = lmsFileInput.files[0].name;
                        uploadBtn.disabled = false;
                    }
                });
                uploadBtn.addEventListener('click', () => {
                    lmsModalBody.innerHTML = `
                        <div class="text-center py-8">
                            <i class="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
                            <h4 class="text-xl font-bold">Submission Successful!</h4>
                            <p class="text-gray-600 mt-2">Your assignment has been uploaded.</p>
                        </div>
                    `;
                });
            }
        });
    });

    lmsModalCloseBtn.addEventListener('click', () => lmsModal.classList.remove('show'));
    lmsModal.addEventListener('click', (e) => { if (e.target === lmsModal) lmsModal.classList.remove('show'); });

    // --- Fee Modal Logic ---
    const feeModalTitle = document.getElementById('fee-modal-title');
    const feeModalBody = document.getElementById('fee-modal-body');
    const feeModalCloseBtn = document.getElementById('fee-modal-close-btn');

    const feeData = {
        'INV-SEM4-001': {
            title: 'Fee Receipt',
            body: `
                <div class="receipt-content">
                    <div class="receipt-header">
                        <h4>K.R. Mangalam University</h4>
                        <p>Sohna Road, Gurugram</p>
                    </div>
                    <div class="receipt-details">
                        <p><strong>Receipt No:</strong> INV-SEM4-001</p>
                        <p><strong>Date:</strong> 15 Jan 2024</p>
                        <p><strong>Student:</strong> Piyush (KRMU-22-12345)</p>
                        <hr style="margin: 15px 0;">
                        <table>
                            <tr><th>Description</th><th style="text-align: right;">Amount</th></tr>
                            <tr><td>Tuition Fee (Semester 4)</td><td style="text-align: right;">₹1,00,000</td></tr>
                        </table>
                        <hr style="margin: 15px 0;">
                        <h4 style="text-align: right;">Total Paid: ₹1,00,000</h4>
                    </div>
                    <div class="receipt-footer">
                        <span class="paid-stamp">PAID</span>
                    </div>
                </div>
            `
        },
        'LATE-FEE-01': {
            title: 'Pay Pending Dues',
            body: `
                <div class="payment-gateway">
                    <p class="text-lg mb-4">You are about to pay <strong>₹5,000</strong> for "Late Fee".</p>
                    <h4 class="font-semibold mb-3">Choose a payment method:</h4>
                    <div class="payment-options">
                        <label class="payment-option p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="paymentMethod" value="upi" checked>
                            <i class="fab fa-google-pay text-3xl"></i>
                            <span>UPI (GPay, PhonePe, etc.)</span>
                        </label>
                        <label class="payment-option p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="paymentMethod" value="card">
                            <i class="fas fa-credit-card text-2xl"></i>
                            <span>Credit / Debit Card</span>
                        </label>
                        <label class="payment-option p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="paymentMethod" value="netbanking">
                            <i class="fas fa-university text-2xl"></i>
                            <span>Net Banking</span>
                        </label>
                    </div>
                    <div class="text-center mt-6">
                        <button id="proceed-to-pay-btn" class="btn-primary" style="width: 100%; padding: 12px;">Proceed to Pay</button>
                    </div>
                </div>
            `
        }
    };

    document.querySelectorAll('.fee-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const invoiceId = btn.dataset.invoice;
            const data = feeData[invoiceId];
            if (data) {
                feeModalTitle.textContent = data.title;
                feeModalBody.innerHTML = data.body;
                feeModal.classList.add('show');

                // Add logic for payment button if it exists
                const proceedBtn = document.getElementById('proceed-to-pay-btn');
                if (proceedBtn) {
                    proceedBtn.addEventListener('click', () => {
                        feeModalBody.innerHTML = `
                            <div class="text-center py-8">
                                <i class="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
                                <h4 class="text-xl font-bold">Payment Successful!</h4>
                                <p class="text-gray-600 mt-2">Your fee has been paid. The ledger will be updated shortly.</p>
                            </div>
                        `;
                    });
                }
            }
        });
    });

    feeModalCloseBtn.addEventListener('click', () => feeModal.classList.remove('show'));
    feeModal.addEventListener('click', (e) => { if (e.target === feeModal) feeModal.classList.remove('show'); });

    // --- Syllabus Modal Logic ---
    const syllabusData = {
        dsa: {
            title: 'CS-401: Data Structures & Algorithms',
            objectives: [
                'To understand the basic concepts of data structures and algorithms.',
                'To learn to analyze the efficiency of algorithms.',
                'To acquire skills in designing and implementing data structures to solve problems.'
            ],
            outcomes: [
                'Ability to analyze algorithms and algorithm correctness.',
                'Ability to summarize searching and sorting techniques.',
                'Ability to describe stack, queue and linked list operations.',
                'Ability to have knowledge of tree and graphs concepts.'
            ],
            units: [
                { title: 'Unit 1: Introduction', topics: ['Algorithm, Asymptotic Notations (Big-O, Omega, Theta)', 'Analysis of Algorithms', 'Space and Time complexity'] },
                { title: 'Unit 2: Linear Data Structures', topics: ['Arrays, Stacks, Queues', 'Linked Lists (Singly, Doubly, Circular)', 'Applications of Stacks and Queues'] },
                { title: 'Unit 3: Non-Linear Data Structures', topics: ['Trees, Binary Trees, Traversal', 'Binary Search Trees (BST), AVL Trees', 'Heaps, Priority Queues', 'Graphs, BFS, DFS'] },
                { title: 'Unit 4: Sorting and Searching', topics: ['Bubble Sort, Insertion Sort, Merge Sort, Quick Sort', 'Linear Search, Binary Search', 'Hashing, Collision Resolution'] }
            ],
            books: [
                { type: 'Textbook', title: 'Data Structures and Algorithm Analysis in C++', author: 'Mark Allen Weiss' },
                { type: 'Reference', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, and Stein' }
            ]
        },
        os: {
            title: 'CS-402: Operating Systems',
            objectives: ['To learn the fundamentals of Operating Systems.', 'To understand the mechanisms of an OS to handle processes and threads.', 'To learn the mechanisms involved in memory management.'],
            outcomes: ['Analyze the structure of OS and basic architectural components.', 'Understand the services provided by and the design of an operating system.', 'Understand the concept of a process and thread and their scheduling.'],
            units: [
                { title: 'Unit 1: OS Introduction', topics: ['OS Structure, Services', 'System Calls', 'Process Concept, Scheduling'] },
                { title: 'Unit 2: Concurrency', topics: ['Threads, Inter-process Communication', 'Critical-Section Problem, Semaphores', 'Deadlocks: Prevention, Avoidance, Detection'] },
                { title: 'Unit 3: Memory Management', topics: ['Main Memory, Swapping', 'Paging, Segmentation', 'Virtual Memory, Demand Paging'] },
                { title: 'Unit 4: Storage Management', topics: ['File System Interface', 'File System Implementation', 'I/O Systems, Disk Scheduling'] }
            ],
            books: [
                { type: 'Textbook', title: 'Operating System Concepts', author: 'Silberschatz, Galvin and Gagne' },
                { type: 'Reference', title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum' }
            ]
        },
        dbms: {
            title: 'CS-403: Database Management Systems',
            objectives: ['To understand the different issues involved in the design and implementation of a database system.', 'To study the physical and logical database designs.', 'To understand and use data manipulation language to query, update, and manage a database.'],
            outcomes: ['Define the terminology, features, and classifications of DBMS.', 'Master the basics of SQL and construct queries using SQL.', 'Understand the relational database design principles.'],
            units: [
                { title: 'Unit 1: Introduction', topics: ['Database System vs. File System', 'Data Models, Schemas, and Instances', 'ER-Model, Relational Model'] },
                { title: 'Unit 2: SQL', topics: ['Data Definition Language (DDL)', 'Data Manipulation Language (DML)', 'Joins, Subqueries, Views'] },
                { title: 'Unit 3: Normalization', topics: ['Functional Dependencies', 'Normal Forms (1NF, 2NF, 3NF, BCNF)', 'Decomposition'] },
                { title: 'Unit 4: Transactions', topics: ['Transaction Concepts, ACID Properties', 'Concurrency Control', 'Recovery Techniques'] }
            ],
            books: [
                { type: 'Textbook', title: 'Database System Concepts', author: 'Korth, Silberschatz, Sudarshan' },
                { type: 'Reference', title: 'Fundamentals of Database Systems', author: 'Elmasri and Navathe' }
            ]
        },
        de: {
            title: 'EC-405: Digital Electronics',
            objectives: ['To understand number representation and conversion between different representation in digital electronic circuits.', 'To analyze logic processes and implement logical operations using logic gates.', 'To understand concepts of sequential circuits.'],
            outcomes: ['Develop a digital logic and apply it to solve real life problems.', 'Analyze, design and implement combinational logic circuits.', 'Classify different semiconductor memories.'],
            units: [
                { title: 'Unit 1: Fundamentals', topics: ['Number Systems, Binary Codes', 'Logic Gates (AND, OR, NOT, XOR)', 'Boolean Algebra, K-Maps'] },
                { title: 'Unit 2: Combinational Circuits', topics: ['Adders, Subtractors', 'Multiplexers, De-multiplexers', 'Encoders, Decoders'] },
                { title: 'Unit 3: Sequential Circuits', topics: ['Flip-Flops (SR, JK, D, T)', 'Registers (SISO, SIPO, PISO, PIPO)', 'Counters (Asynchronous, Synchronous)'] },
                { title: 'Unit 4: Memory & Converters', topics: ['RAM, ROM, PLA, PAL', 'Analog-to-Digital Converters (ADC)', 'Digital-to-Analog Converters (DAC)'] }
            ],
            books: [
                { type: 'Textbook', title: 'Digital Design', author: 'M. Morris Mano' },
                { type: 'Reference', title: 'Digital Systems: Principles and Applications', author: 'R. J. Tocci' }
            ]
        }
    };

    const syllabusModalTitle = document.getElementById('syllabus-modal-title');
    const syllabusModalBody = document.getElementById('syllabus-modal-body');
    const syllabusModalCloseBtn = document.getElementById('syllabus-modal-close-btn');
    

    document.querySelectorAll('.syllabus-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const courseId = btn.dataset.course;
            const data = syllabusData[courseId];
    
            if (data) {
                syllabusModalTitle.textContent = data.title;
                
                const objectivesHTML = data.objectives.map(o => `<li>${o}</li>`).join('');
                const outcomesHTML = data.outcomes.map(o => `<li>${o}</li>`).join('');
                const unitsHTML = data.units.map((unit, index) => `
                    <div class="syllabus-accordion-item">
                        <div class="syllabus-accordion-header">
                            <strong>${unit.title}</strong>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="syllabus-accordion-content">
                            <ul class="syllabus-topics">${unit.topics.map(t => `<li>${t}</li>`).join('')}</ul>
                        </div>
                    </div>
                `).join('');
                const booksHTML = data.books.map(b => `<li><strong>[${b.type}]</strong> ${b.title} by ${b.author}</li>`).join('');
    
                syllabusModalBody.innerHTML = `
                    <div class="syllabus-section"><h5 class="syllabus-section-title"><i class="fas fa-bullseye"></i> Course Objectives</h5><ul class="syllabus-list">${objectivesHTML}</ul></div>
                    <div class="syllabus-section"><h5 class="syllabus-section-title"><i class="fas fa-check-double"></i> Course Outcomes</h5><ul class="syllabus-list">${outcomesHTML}</ul></div>
                    <div class="syllabus-section"><h5 class="syllabus-section-title"><i class="fas fa-layer-group"></i> Course Modules</h5><div class="syllabus-accordion">${unitsHTML}</div></div>
                    <div class="syllabus-section"><h5 class="syllabus-section-title"><i class="fas fa-book-open"></i> Recommended Books</h5><ul class="syllabus-list">${booksHTML}</ul></div>
                    <div class="text-center mt-6">
                        <a href="#" class="btn-primary" style="padding: 10px 20px;"><i class="fas fa-download"></i> Download Full Syllabus PDF</a>
                    </div>
                `;
                syllabusModal.classList.add('show');

                // Add accordion functionality
                syllabusModalBody.querySelectorAll('.syllabus-accordion-header').forEach(header => {
                    header.addEventListener('click', () => {
                        const content = header.nextElementSibling;
                        const icon = header.querySelector('i');
                        if (content.style.maxHeight) {
                            content.style.padding = '0 1.25rem';
                            content.style.maxHeight = null;
                            icon.style.transform = 'rotate(0deg)';
                        } else {
                            content.style.padding = '1rem 1.25rem';
                            content.style.maxHeight = content.scrollHeight + "px";
                            icon.style.transform = 'rotate(180deg)';
                        }
                    });
                });
            }
        });
    });

    syllabusModalCloseBtn.addEventListener('click', () => syllabusModal.classList.remove('show'));
    syllabusModal.addEventListener('click', (e) => {
        if (e.target === syllabusModal) syllabusModal.classList.remove('show');
    });


    // --- New Circulars Page Logic ---
    const circularsData = [
        { id: 1, date: '20 Apr 2024', title: 'Circular regarding End Term Examination Schedule', category: 'academic', urgency: 'urgent', content: notificationData['exam-schedule'].body },
        { id: 2, date: '18 Apr 2024', title: 'Notice for Convocation 2024 Registration', category: 'general', urgency: 'info', content: notificationData['convocation'].body },
        { id: 3, date: '15 Apr 2024', title: 'Holiday on account of Ram Navami', category: 'general', urgency: 'general', content: notificationData['holiday'].body },
        { id: 4, date: '10 Apr 2024', title: 'Fee Payment Deadline Extension', category: 'fee', urgency: 'info', content: notificationData['fee-deadline'].body },
        { id: 5, date: '01 Apr 2024', title: 'Mid-Term Sessional Marks Published', category: 'academic', urgency: 'general', content: notificationData['sessional-marks'].body },
    ];

    const circularsList = document.getElementById('circulars-list');

    function renderCirculars(filter = 'all') {
        circularsList.innerHTML = '';
        const filteredData = circularsData.filter(c => filter === 'all' || c.category === filter);

        filteredData.forEach(c => {
            const badgeClass = c.urgency === 'urgent' ? 'badge-urgent' : (c.urgency === 'info' ? 'badge-info' : 'badge-general');
            const circularCard = document.createElement('div');
            circularCard.className = 'content-card';
            circularCard.style.cursor = 'pointer';
            circularCard.innerHTML = `
                <div class="circular-header flex justify-between items-center">
                    <div>
                        <h4 class="text-lg font-bold">${c.title}</h4>
                        <small class="text-light">${c.date}</small>
                    </div>
                    <span class="status-badge ${badgeClass}">${c.urgency.toUpperCase()}</span>
                </div>
                <div class="circular-content hidden mt-4 pt-4 border-t border-soft">
                    ${c.content}
                    <a href="#" class="btn-primary mt-4 inline-block"><i class="fas fa-download"></i> Download PDF</a>
                </div>
            `;
            circularsList.appendChild(circularCard);

            circularCard.addEventListener('click', () => {
                const content = circularCard.querySelector('.circular-content');
                content.classList.toggle('hidden');
            });
        });
    }

    document.querySelectorAll('.circular-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.circular-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderCirculars(this.dataset.filter);
        });
    });

    // --- New Settings Page Logic ---
    const settingsTabs = document.querySelectorAll('.settings-tab-btn');
    const settingsContents = document.querySelectorAll('.settings-tab-content');

    // Add light-mode class to body for theme toggle
    document.getElementById('toggle-theme').addEventListener('change', function() {
        document.body.classList.toggle('light-mode', !this.checked); // Assuming dark is default
    });

    settingsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            settingsTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            settingsContents.forEach(content => {
                content.classList.toggle('active', content.id === `tab-${this.dataset.tab}`);
            });
        });
    });

    // --- Password Strength Meter Logic ---
    const newPasswordInput = document.getElementById('new-password');
    const strengthBars = document.querySelectorAll('.strength-bar');

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            if (password.length > 7) strength++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;

            const colors = ['#dc3545', '#ffc107', '#28a745', '#28a745'];
            strengthBars.forEach((bar, index) => {
                bar.style.backgroundColor = index < strength ? colors[strength - 1] : 'rgba(255, 255, 255, 0.1)';
            });
        });
    }

    // --- 2FA Modal Logic ---
    const toggle2FA = document.getElementById('toggle-2fa');
    const modal2FA = document.getElementById('modal-2fa');
    if (toggle2FA && modal2FA) {
        toggle2FA.addEventListener('change', function() {
            if (this.checked) {
                modal2FA.classList.add('show');
            } else {
                // Logic to disable 2FA would go here
                alert('2FA Disabled.');
            }
        });
        modal2FA.querySelectorAll('.modal-close-btn, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', () => {
                modal2FA.classList.remove('show');
                toggle2FA.checked = false; // Revert toggle if cancelled
            });
        });
    }

    // --- NEFT Form Logic ---
    const neftForm = document.getElementById('neft-challan-form');
    if (neftForm) {
        neftForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const feeType = document.getElementById('fee-type').value;
            const amount = document.getElementById('amount').value;
            if (!feeType || !amount) {
                alert('Please select a fee type and enter an amount.');
                return;
            }

            const challanId = 'NEFT-KRU-' + new Date().getFullYear() + '-' + (Math.floor(Math.random() * 90000) + 10000);
            const studentName = "Piyush"; // Hardcoded for demo
            const challanHTML = `
                <div class="content-card">
                    <h3 class="text-center">NEFT Payment Challan</h3>
                    <p class="text-center text-light mb-6">Print this challan and submit it to the accounts department.</p>
                    <p><strong>Challan ID:</strong> ${challanId}</p>
                    <p><strong>Student Name:</strong> ${studentName}</p>
                    <p><strong>Fee Type:</strong> ${feeType}</p>
                    <p><strong>Amount:</strong> ₹${amount}</p>
                    <div class="text-center my-6"><img src="https://barcode.tec-it.com/barcode.ashx?data=${challanId}&code=Code128&dpi=96" alt="Barcode"></div>
                    <button id="print-challan-btn" class="btn-primary w-full">Print Challan</button>
                </div>
            `;
            document.getElementById('challan-view-result').innerHTML = challanHTML;
            document.getElementById('neft-form-container').classList.remove('active');
            document.getElementById('challan-view-result').classList.add('active');
            document.getElementById('print-challan-btn').addEventListener('click', () => window.print());
        });
    }

    // --- Grievance Redressal Logic ---
    if (grievanceForm) {
        grievanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const grievanceType = document.getElementById('grievance-type').value;
            const grievanceTitle = document.getElementById('grievance-title').value;

            if (!grievanceType || !grievanceTitle) {
                alert('Please fill out all required fields.');
                return;
            }

            const grievanceId = `GRV-2024/A-${Math.floor(100 + Math.random() * 900)}`;
            const submissionDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

            const historyGrid = document.querySelector('.grievance-history-grid');
            const newCard = document.createElement('div');
            newCard.className = 'grievance-history-card';
            newCard.dataset.grievanceId = grievanceId;
            newCard.innerHTML = `
                <div class="grievance-history-header">
                    <div class="grievance-id">${grievanceId}</div>
                    <span class="status-badge" style="background-color: var(--badge-filed-bg); color: var(--badge-filed-text);">Filed & Awaiting Screening</span>
                </div>
                <div class="grievance-history-body">
                    <p><strong>Type:</strong> ${grievanceType}</p>
                    <p><strong>Date Filed:</strong> ${submissionDate}</p>
                    <button class="btn-primary view-grievance-btn">View Details</button>
                </div>
            `;

            const detailsRow = document.createElement('div');
            detailsRow.className = 'grievance-details-row';
            detailsRow.id = `details-${grievanceId}`;
            detailsRow.style.display = 'none';
            detailsRow.innerHTML = `<div class="ticket-details-content">
                <ul class="ticket-history">
                    <li>
                        <strong>Filed & Awaiting Screening</strong>
                        <small>${submissionDate}</small>
                        <p>Grievance successfully filed and is awaiting initial screening by the committee.</p>
                    </li>
                </ul>
            </div>`;

            historyGrid.prepend(detailsRow);
            historyGrid.prepend(newCard);

            newCard.querySelector('.view-grievance-btn').addEventListener('click', handleViewGrievanceClick);

            // Update grievance stats
            updateGrievanceStats();

            alert('Your formal grievance has been filed. Grievance ID: ' + grievanceId);
            grievanceForm.reset();
        });
    }

    function updateGrievanceStats() {
        const cards = document.querySelectorAll('.grievance-history-card');
        let total = cards.length;
        let resolved = 0;
        let pending = 0;

        cards.forEach(card => {
            const statusBadge = card.querySelector('.status-badge');
            if (statusBadge) {
                const statusText = statusBadge.textContent.toLowerCase();
                if (statusText.includes('resolved') || statusText.includes('decision rendered')) {
                    resolved++;
                } else {
                    pending++;
                }
            }
        });

        // Update overall stats
        const overallStats = document.querySelector('.overall-grievance-stats');
        if (overallStats) {
            overallStats.textContent = `Total Grievances: ${total} | Resolved: ${resolved} | Pending: ${pending}`;
        }

        // Update resolved card
        const resolvedCard = document.querySelector('.grievance-card.resolved');
        if (resolvedCard) {
            resolvedCard.querySelector('.stat-value').textContent = resolved;
            const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
            resolvedCard.querySelector('.percentage').textContent = `${percentage}%`;
            const fg = resolvedCard.querySelector('.circular-progress .fg');
            if (fg) {
                const dashoffset = 220 - (220 * percentage / 100);
                fg.setAttribute('data-dashoffset', dashoffset);
                fg.style.strokeDashoffset = dashoffset;
            }
        }

        // Update pending card
        const pendingCard = document.querySelector('.grievance-card.pending');
        if (pendingCard) {
            pendingCard.querySelector('.stat-value').textContent = pending;
            const percentage = total > 0 ? Math.round((pending / total) * 100) : 0;
            pendingCard.querySelector('.percentage').textContent = `${percentage}%`;
            const fg = pendingCard.querySelector('.circular-progress .fg');
            if (fg) {
                const dashoffset = 220 - (220 * percentage / 100);
                fg.setAttribute('data-dashoffset', dashoffset);
                fg.style.strokeDashoffset = dashoffset;
            }
        }
    }

    function handleViewGrievanceClick(e) {
        const btn = e.target;
        const card = btn.closest('.grievance-history-card');
        const grievanceId = card.dataset.grievanceId;
        const detailsRow = document.getElementById(`details-${grievanceId}`);

        if (detailsRow) {
            if (detailsRow.style.display === 'block') {
                detailsRow.style.display = 'none';
                btn.textContent = 'View Details';
            } else {
                detailsRow.style.display = 'block';
                btn.textContent = 'Hide Details';
            }
        }
    }
    document.querySelectorAll('.view-grievance-btn').forEach(btn => btn.addEventListener('click', handleViewGrievanceClick));

    // Initialize stats on load
    updateGrievanceStats();

    // --- Service Request Logic ---
    if (serviceRequestForm) {
        serviceRequestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const category = document.getElementById('request-category').value;
            const subject = document.getElementById('request-subject').value;
            const description = document.getElementById('request-description').value;

            if (!category || !subject || !description) {
                alert('Please fill out all fields.');
                return;
            }

            const ticketId = `SRV-2024-${Math.floor(10000 + Math.random() * 90000)}`;
            const submissionDate = new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            const tableBody = document.getElementById('request-table-body');
            const newRow = document.createElement('tr');
            newRow.dataset.ticketId = ticketId;
            newRow.innerHTML = `
                <td>${ticketId}</td>
                <td>${submissionDate}</td>
                <td>${category}</td>
                <td><span class="status-badge status-pending">Submitted</span></td>
                <td><button class="btn-primary view-ticket-btn">View</button></td>
            `;

            const detailsRow = document.createElement('tr');
            detailsRow.className = 'ticket-details-row';
            detailsRow.id = `details-${ticketId}`;
            detailsRow.innerHTML = `<td colspan="5"><div class="ticket-details-content">
                <p><strong>Original Request:</strong> ${description}</p>
                <ul class="ticket-history">
                    <li>
                        <strong>Ticket Submitted</strong>
                        <small>${submissionDate}</small>
                    </li>
                </ul>
            </div></td>`;

            tableBody.prepend(detailsRow);
            tableBody.prepend(newRow);

            // Re-attach event listener to the new button
            newRow.querySelector('.view-ticket-btn').addEventListener('click', handleViewTicketClick);

            alert('Your request has been submitted successfully! Ticket ID: ' + ticketId);
            serviceRequestForm.reset();
        });
    }

    function handleViewTicketClick(e) {
        const btn = e.target;
        const row = btn.closest('tr');
        const ticketId = row.dataset.ticketId;
        const detailsRow = document.getElementById(`details-${ticketId}`);

        if (detailsRow) {
            if (detailsRow.style.display === 'table-row') {
                detailsRow.style.display = 'none';
                btn.textContent = 'View';
            } else {
                detailsRow.style.display = 'table-row';
                btn.textContent = 'Hide';
            }
        }
    }

    document.querySelectorAll('.view-ticket-btn').forEach(btn => btn.addEventListener('click', handleViewTicketClick));

    // --- NEFT Helper Functions ---
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSelector = this.dataset.clipboardTarget;
            const textToCopy = document.querySelector(targetSelector).value;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Copied!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }

    window.updateAmount = function(feeType) {
        const amountMap = { 'Hostel Fee': '35000', 'Tuition Fee': '95000', 'Transport Fee': '15000', 'Exam Fee': '2500' };
        document.getElementById('amount').value = amountMap[feeType] || '';
    }

    renderCirculars(); // Initial render

    // Notification Bell Functionality
    const notificationBell = document.getElementById('notification-bell');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const notificationCount = document.getElementById('notification-count');
    const notificationItems = document.getElementById('notification-items');
    const markAllReadBtn = document.getElementById('mark-all-read');

    // Sample notifications data
    let notifications = [
        { id: 1, title: 'End Term Exam Schedule', message: 'The schedule has been released. Check LMS for details.', time: '2 hours ago', unread: true },
        { id: 2, title: 'Fee Payment Reminder', message: 'Your pending fee is due soon. Pay before deadline.', time: '1 day ago', unread: true },
        { id: 3, title: 'Convocation Registration', message: 'Registration for convocation is now open.', time: '3 days ago', unread: true },
        { id: 4, title: 'Holiday Notice', message: 'University closed on Ram Navami.', time: '1 week ago', unread: false },
    ];

    // Function to render notifications
    function renderNotifications() {
        notificationItems.innerHTML = '';
        let unreadCount = 0;
        notifications.forEach(notif => {
            if (notif.unread) unreadCount++;
            const item = document.createElement('div');
            item.className = `notification-item ${notif.unread ? 'unread' : ''}`;
            item.innerHTML = `
                <div class="title">${notif.title}</div>
                <div class="message">${notif.message}</div>
                <div class="time">${notif.time}</div>
            `;
            item.addEventListener('click', () => {
                if (notif.unread) {
                    notif.unread = false;
                    updateNotificationCount();
                    renderNotifications();
                }
                // Open notification modal
                const notificationModal = document.getElementById('notification-modal');
                const modalTitle = document.getElementById('notification-modal-title');
                const modalBody = document.getElementById('notification-modal-body');
                modalTitle.textContent = notif.title;
                modalBody.innerHTML = `<p>${notif.message}</p>`;
                notificationModal.classList.add('show');
                notificationDropdown.classList.remove('show'); // Close dropdown
            });
            notificationItems.appendChild(item);
        });
        if (notifications.length === 0) {
            notificationItems.innerHTML = '<div class="notification-empty">No notifications</div>';
        }
        updateNotificationCount();
    }

    // Update count
    function updateNotificationCount() {
        const unread = notifications.filter(n => n.unread).length;
        notificationCount.textContent = unread;
        if (unread > 0) {
            notificationCount.classList.add('show');
        } else {
            notificationCount.classList.remove('show');
        }
    }

    // Toggle dropdown
    notificationBell.addEventListener('click', () => {
        notificationDropdown.classList.toggle('show');
    });

    // Mark all read
    markAllReadBtn.addEventListener('click', () => {
        notifications.forEach(n => n.unread = false);
        updateNotificationCount();
        renderNotifications();
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!notificationBell.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('show');
        }
    });

    // Initialize
    renderNotifications();

    // Show welcome toast
    setTimeout(() => {
        showToast('Welcome back! You have new notifications.');
    }, 2000);

    // Notifications page functionality
    const notificationSearch = document.getElementById('notification-search');
    const markAllNotificationsRead = document.getElementById('mark-all-notifications-read');
    const notificationsBody = document.getElementById('notifications-body');

    // Filter function
    if (notificationSearch) {
        notificationSearch.addEventListener('input', () => {
            const query = notificationSearch.value.toLowerCase();
            const rows = notificationsBody.querySelectorAll('tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // Mark all read
    if (markAllNotificationsRead) {
        markAllNotificationsRead.addEventListener('click', () => {
            const rows = notificationsBody.querySelectorAll('tr.unread');
            rows.forEach(row => row.classList.remove('unread'));
            showToast('All notifications marked as read.');
        });
    }
});
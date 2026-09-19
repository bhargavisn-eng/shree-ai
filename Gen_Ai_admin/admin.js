const API =
    "http://localhost:5000";

let adminPassword = "";


// ======================================================
// LOGIN
// ======================================================

document
    .getElementById("login-btn")
    .addEventListener("click", async () => {

        adminPassword =
            document
                .getElementById("admin-password")
                .value;

        if (!adminPassword) {

            document
                .getElementById("login-message")
                .textContent =
                "Enter password.";

            return;
        }


        await loadPayments();

    });


// ======================================================
// LOAD PAYMENTS
// ======================================================

async function loadPayments() {

    try {

        const response =
            await fetch(
                `${API}/api/admin/payments`,
                {
                    headers: {
                        "x-admin-password":
                            adminPassword
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            document
                .getElementById("login-message")
                .textContent =
                data.message ||
                "Login failed.";

            return;
        }


        document
            .getElementById("login-section")
            .style.display = "none";


        document
            .getElementById("dashboard")
            .style.display = "block";


        displayPayments(
            data.payments
        );


    } catch (error) {

        console.error(error);

        document
            .getElementById("login-message")
            .textContent =
            "Could not connect to server.";

    }

}


// ======================================================
// DISPLAY PAYMENTS
// ======================================================

function displayPayments(payments) {

    const container =
        document.getElementById("payments");


    container.innerHTML = "";


    if (payments.length === 0) {

        container.innerHTML =
            "<p>No payments yet.</p>";

        return;
    }


    payments
        .slice()
        .reverse()
        .forEach(payment => {

            const div =
                document.createElement("div");


            div.className =
                "payment";


            div.innerHTML = `

                <h3>
                    ${escapeHTML(payment.name)}
                </h3>

                <p>
                    📧
                    ${escapeHTML(payment.email)}
                </p>

                <p>
                    💰 ₹${payment.amount}
                </p>

                <p>
                    🔑 Transaction ID:
                    <strong>
                        ${escapeHTML(payment.transactionId)}
                    </strong>
                </p>

                <p>
                    📅
                    ${new Date(
                        payment.submittedAt
                    ).toLocaleString()}
                </p>

                <p>
                    Status:
                    <span class="status">
                        ${payment.status}
                    </span>
                </p>

                ${
                    payment.status === "pending"
                    ?

                    `

                    <button
                        class="verify"
                        onclick="verifyPayment('${payment.id}')"
                    >
                        ✅ Verify & Activate Pro
                    </button>

                    <button
                        class="reject"
                        onclick="rejectPayment('${payment.id}')"
                    >
                        ❌ Reject
                    </button>

                    `

                    :

                    ""
                }

            `;


            container.appendChild(div);

        });

}


// ======================================================
// VERIFY PAYMENT
// ======================================================

async function verifyPayment(id) {

    const confirmed =
        confirm(
            "Have you checked the ₹199 payment in your UPI/bank account?"
        );


    if (!confirmed) {

        return;

    }


    const response =
        await fetch(
            `${API}/api/admin/verify`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "x-admin-password":
                        adminPassword
                },

                body: JSON.stringify({
                    paymentId: id
                })
            }
        );


    const data =
        await response.json();


    alert(data.message);


    await loadPayments();

}


// ======================================================
// REJECT PAYMENT
// ======================================================

async function rejectPayment(id) {

    const confirmed =
        confirm(
            "Reject this payment?"
        );


    if (!confirmed) {

        return;
    }


    const response =
        await fetch(
            `${API}/api/admin/reject`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "x-admin-password":
                        adminPassword
                },

                body: JSON.stringify({
                    paymentId: id
                })
            }
        );


    const data =
        await response.json();


    alert(data.message);


    await loadPayments();

}


// ======================================================
// REFRESH
// ======================================================

document
    .getElementById("refresh-btn")
    .addEventListener(
        "click",
        loadPayments
    );


// ======================================================
// BASIC HTML ESCAPING
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}